var i18nc = require('i18nc');

module.exports = function(grunt)
{
	grunt.registerMultiTask('i18nc-po', 'Create i18nc po files.', function()
	{
		var outputDir = this.data.output;
		var options = this.options();
		if (!outputDir) return;
		var translateWords = grunt.i18nc && grunt.i18nc.translateWords;

		if (!translateWords) return;

		var done = this.async();
		i18nc.util.mulitResult2POFiles(translateWords, outputDir, options)
			.then(function()
			{
				done();
			},
			done);
	});
};
