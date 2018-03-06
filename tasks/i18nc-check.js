var i18nc = require('i18nc');
var cliPrinter = i18nc.util.cli;
cliPrinter.colors.enabled = false;

module.exports = function(grunt)
{
	grunt.registerMultiTask('i18nc-check', 'Check I18N handler wrapped stauts of JS files.', function()
	{
		var self = this;
		var options = self.options({});
		var checkFailNum = 0;

		self.files.forEach(function(file)
		{
			var srcFile = file.src[0];
			var content = grunt.file.read(srcFile).toString();
			var json = i18nc(content, options);
			var newlist = json.allCodeTranslateWords().list4newWordAsts();
			var dirtyWords = json.allDirtyWords();

			if (!newlist.length)
			{
				grunt.log.writeln('  '+'ok'.green+' '+srcFile);
			}
			else
			{
				grunt.log.writeln('  '+'fail'.red+' '+srcFile);
				var output = '';
				grunt.verbose.writeln('newlist:'+newlist.length+' dirtyWords:'+dirtyWords.list.length);

				if (newlist.length)
				{
					output += cliPrinter.printNewWords(newlist, 7);
				}
				if (newlist.length && dirtyWords.list.length)
				{
					output += '       ===========================\n'
				}
				if (dirtyWords.list.length)
				{
					output += cliPrinter.printDirtyWords(dirtyWords, 7);
				}

				grunt.log.writeln(output);
				checkFailNum++;
			}
		});

		var checkSucNumStr = ''+(this.files.length - checkFailNum);
		var checkFailNumStr = ''+checkFailNum;
		grunt.log.writeln('Check File Result, Suc: '+checkSucNumStr.green+ ',   Fail: '+checkFailNumStr.red);

		if (checkFailNum) throw new Error('Check Wrap Fail');
	});
};
