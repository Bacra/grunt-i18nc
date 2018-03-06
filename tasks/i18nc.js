var i18nc = require('i18nc');
var cliPrinter = i18nc.util.cli;
var extend = require('extend');
var path = require('path');

function toLinux(p)
{
	return p && path.normalize(p).replace(/\\/g, '/');
}


module.exports = function(grunt)
{
	grunt.registerMultiTask('i18nc', 'Add I18N handler into JS files.', function()
	{
		var self = this;
		var options = self.options(
			{
				poFilesInputDir: null,
				isHoldError: true
			});
		var dbTranslateWords = options.dbTranslateWords || {};


		if (options.poFilesInputDir)
		{
			var done = self.async();
			i18nc.util.loadPOFiles(options.poFilesInputDir)
				.then(function(data)
				{
					dbTranslateWords = extend(true, data, dbTranslateWords);
					main(self.files, dbTranslateWords, options);
					done();
				})
				.catch(done);
		}
		else
		{
			main(self.files, dbTranslateWords, options);
		}
	});


	function main(files, dbTranslateWords, options)
	{
		if (!grunt.i18nc) grunt.i18nc = {};
		var translateWordsOutput
			= grunt.i18nc.translateWords
			= (grunt.i18nc.translateWords = {});

		var errorArr = [];

		files.forEach(function(file)
		{
			var srcFile = file.src[0];
			var destFile = file.dest;
			if (!grunt.file.isFile(srcFile)) return;

			var content = grunt.file.read(srcFile).toString();

			var pcwd = process.cwd();
			var fullCwd = path.resolve(pcwd, file.orig.cwd);
			var fullSrcFile = path.resolve(pcwd, srcFile);
			var fullDestFile = path.resolve(pcwd, destFile);

			grunt.verbose.writeln('full cwd:'+fullCwd
				+' src:'+fullSrcFile
				+' dest:'+fullDestFile);

			var opts = grunt.util._.extend(options,
					{
						cwd					: fullCwd,
						srcFile				: toLinux(path.resolve(fullCwd, fullSrcFile)),
						destFile			: toLinux(path.resolve(fullCwd, fullDestFile)),
						dbTranslateWords	: dbTranslateWords,
					});

			try {
				var info = i18nc(content, opts);
			}
			catch(err)
			{
				if (options.isHoldError)
				{
					grunt.log.error('parse file error:'+srcFile+' err:'+err.message);
					errorArr.push(
						{
							file: srcFile,
							error: err
						});
					return;
				}
				else
				{
					grunt.log.error('Error File:'+srcFile);
					throw err;
				}
			}

			var dirtyWords = info.allDirtyWords();
			if (dirtyWords.list.length)
			{
				var output = cliPrinter.printDirtyWords(dirtyWords, 2);
				grunt.log.writeln('  File DirtyWords: '+srcFile);
				grunt.log.writeln(output);
			}

			grunt.file.write(destFile, info.code);
			_removeResultCode(info);
			translateWordsOutput[srcFile] = info;
		});


		if (errorArr.length)
		{
			grunt.log.error('[Error File List]');
			errorArr.forEach(function(item)
			{
				grunt.log.error('File:'+item.file+'\n Error Message:'+item.error.message);
			});
			throw new Error('Some file Is Error');
		}
	}
};

function _removeResultCode(json)
{
	delete json.code;
	json.subScopeDatas.forEach(_removeResultCode);
}
