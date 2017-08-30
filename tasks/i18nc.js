var i18nc = require('i18nc');
var extend = require('extend');
var path = require('path');

function toLinux(p)
{
	return p && path.normalize(p).replace(/\//g, '/');
}


module.exports = function(grunt)
{
	grunt.registerMultiTask('i18nc', 'i18nc', function()
	{
		var self = this;
		var options = self.options(
			{
				isHoldError: true
			});
		var translateFile = options.translateFile;

		var translateData = {};
		var dbTranslateWords;
		if (translateFile)
		{
			try {
				dbTranslateWords = grunt.file.readJSON(translateFile);
			}
			catch(err)
			{
				grunt.file.copy(translateFile, translateFile+'.bak_'+self.target);
				grunt.log.warn('read translateFile err: '.red + translateFile);
			}
		}

		dbTranslateWords = extend(true, {}, options.translateData, dbTranslateWords);

		if (!grunt.i18nc) grunt.i18nc = {};

		var translateWordsOutput
			= grunt.i18nc.translateWords
			= (grunt.i18nc.translateWords = {});

		var errorArr = [];

		self.files.forEach(function(file)
		{
			var srcfile = file.src[0];
			var destfile = file.dest;

			if (!grunt.file.isFile(srcfile)) return;

			var content = grunt.file.read(srcfile);
			var opts = grunt.util._.extend(options,
					{
						defaultFilekey: toLinux(srcfile),
						dbTranslateWords: dbTranslateWords,
					});

			try {
				var info = i18nc(content, opts);
			}
			catch(err)
			{
				if (options.isHoldError)
				{
					grunt.log.error('parse file error:'+srcfile+' err:'+err.message);
					errorArr.push(
						{
							file: srcfile,
							error: err
						});
					return;
				}
				else
				{
					grunt.log.error('Error File:'+srcfile);
					throw err;
				}
			}

			if (info.dirtyWords.length)
			{
				grunt.log.warn('Dirty words call I18N Function:\n  '+info.dirtyWords.join('  \n'));
			}

			grunt.file.write(destfile, info.code);


			translateWordsOutput[srcfile] =
			{
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

		if (options.translateOutputFile)
		{
			grunt.file.write(options.translateOutputFile, JSON.stringify(grunt.i18nc.translateWords, null, '\t'));
		}
	});
};
