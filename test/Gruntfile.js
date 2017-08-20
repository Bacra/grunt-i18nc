module.exports = function(grunt)
{
	grunt.initConfig(
	{
		i18nc:
		{
			options:
			{
				translateData: {},
				translateFile: 'files/translate_data.json',
				translateOutputFile: 'tmp/translate_output.json',
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
