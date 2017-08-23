module.exports = function(grunt)
{
	grunt.initConfig(
	{
		i18nc:
		{
			options:
			{
				isIgnoreScanWarn	: true,
				translateData		: {},
				translateFile		: 'files/translate_data.json',
				translateOutputFile	: 'tmp/translate_output.json',
			},
			test:
			{
				src: '*.js',
				cwd: 'files/',
				dest: 'tmp/',
				filter: 'isFile',
				expand: true
			}
		}
	});

	grunt.loadTasks('../tasks');
	grunt.registerTask('default', ['i18nc']);
};
