var i18nc = require('i18nc');
var extend = require('extend');
var path = require('path');

function toLinux(p)
{
	return p && path.normalize(p).replace(/\\/g, '/');
}


module.exports = function(grunt)
{
	grunt.registerMultiTask('i18nc', 'i18nc', function()
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

			var fullCwd = path.resolve(process.cwd(), file.orig.cwd);
			var fullSrcFile = path.resolve(process.cwd(), srcFile);

			grunt.verbose.writeln('full cwd:'+fullCwd+' src:'+fullSrcFile);

			if (!grunt.file.isFile(srcFile)) return;

			var content = grunt.file.read(srcFile).toString();
			var opts = grunt.util._.extend(options,
					{
						cwd					: fullCwd,
						srcFile				: toLinux(path.resolve(fullCwd, fullSrcFile)),
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

			if (info.dirtyAsts.length)
			{
				grunt.log.warn('Dirty words call I18N Function:\n  '+info.dirtyAsts.map(function(item){return item.code}).join('  \n'));
			}

			grunt.file.write(destFile, info.code);

			translateWordsOutput[srcFile] =
			{
				currentFileKey		: info.currentFileKey,
				funcTranslateWords	: info.funcTranslateWords,
				codeTranslateWords	: info.codeTranslateWords,
				usedTranslateWords	: info.usedTranslateWords,
			};
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
