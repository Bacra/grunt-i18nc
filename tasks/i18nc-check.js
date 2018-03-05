var i18nc = require('i18nc');

module.exports = function(grunt)
{
	grunt.registerMultiTask('i18nc-check', 'Check I18N handler wrapped stauts of JS files.', function()
	{
		var self = this;
		var options = self.options({});
		var isCheckFail = false;

		self.files.forEach(function(file)
		{
			var srcFile = file.src[0];
			var content = grunt.file.read(srcFile).toString();
			var json = i18nc(content, options);
			var newlist = json.allCodeTranslateWords().list4newWordAsts();

			if (!newlist.length)
			{
				grunt.log.writeln('  '+'ok'.green+' '+srcFile);
			}
			else
			{
				grunt.log.writeln('  '+'fail'.red+' '+srcFile);
				newlist.forEach(function(item)
				{
					var ast = item.originalAst;
					var localStr = 'Loc:'+ast.loc.start.line+','+ast.loc.start.column;
					var wordsStr = item.translateWords.join(',');
					grunt.log.writeln('       '+(localStr.gray || localStr)+'    '+wordsStr);
				});
				isCheckFail = true;
			}
		});

		if (isCheckFail) throw new Error('Check Wrap Fail');
	});
};
