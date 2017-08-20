var i18nc = require('i18nc');
var extend = require('extend');

module.exports = function(grunt)
{
	grunt.registerMultiTask('i18nc', 'i18nc', function()
	{
		var self = this;
		var options = self.options();
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

		self.files.forEach(function(file)
		{
			var newfile = file.src[0];
			var oldfile = file.dest;

			if (!grunt.file.isFile(newfile)) return;

			var content = grunt.file.read(newfile);
			var opts = grunt.util._.extend(options,
					{
						defaultFilekey: newfile,
						dbTranslateWords: translateTaskAllData,
					});

			var info = i18nc(content, opts);

			if (info.dirtyWords.length)
			{
				grunt.log.warn('Dirty words call I18N Function:\n  '+info.dirtyWords.join('  \n'));
			}

			grunt.file.write(oldfile, info.code);
			translateWordsOutput[newfile] =
			{
				funcTranslateWords	: info.funcTranslateWords,
				codeTranslateWords	: info.codeTranslateWords,
				usedTranslateWords	: info.usedTranslateWords,
			};
		});


		if (options.translateOutputFile)
		{
			grunt.file.write(options.translateOutputFile, JSON.stringify(translateWordsOutput, null, '\t'));
		}
	});
};
