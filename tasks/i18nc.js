var i18nc = require('i18nc');
var extend = require('extend');

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
		var translateAllData;
		var translateTaskAllData;
		if (translateFile && grunt.file.isFile(translateFile))
		{
			try {
				translateAllData = grunt.file.readJSON(translateFile);
			}
			catch(err)
			{
				grunt.file.copy(translateFile, translateFile+'.bak_'+self.target);
				grunt.log.warn('read translateFile err: '.red + translateFile);
			}
		}

		translateAllData = extend(true, {}, options.translateData, translateAllData);

		translateTaskAllData = translateAllData[self.target]
			|| (translateAllData[self.target] = {});

		translateTaskAllData = extend(true, {}, translateAllData['<all tasks>'], translateTaskAllData);

		if (!grunt.i18nc) grunt.i18nc = {};
		if (!grunt.i18nc.translateWords) grunt.i18nc.translateWords = {};

		var translateWordsOutput
			= grunt.i18nc.translateWords[self.target]
			= (grunt.i18nc.translateWords[self.target] = {});

		var errorArr = [];

		self.files.forEach(function(file)
		{
			var srcfile = file.src[0];
			var destfile = file.dest;

			if (!grunt.file.isFile(srcfile)) return;

			var content = grunt.file.read(srcfile);
			var opts = grunt.util._.extend(options,
					{
						defaultFilekey: srcfile,
						dbTranslateWords: translateTaskAllData,
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
