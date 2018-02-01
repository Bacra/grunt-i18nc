var i18ncPO = require('i18nc-po');

module.exports = function(grunt)
{
	grunt.registerMultiTask('i18nc-po', 'i18nc po', function()
	{
		var outputDir = this.data.output;
		var options = this.options();
		if (!outputDir) return;
		var translateWords = grunt.i18nc && grunt.i18nc.translateWords;

		if (!translateWords) return;

		var output = i18ncPO.create({subScopeDatas: grunt.util._.values(translateWords)}, options);
		grunt.file.write(outputDir+'/all.po', output.po);
		grunt.util._.each(output.pot, function(content, file)
		{
			grunt.file.write(outputDir+'/'+file+'.pot', content);
		});

	});
};
