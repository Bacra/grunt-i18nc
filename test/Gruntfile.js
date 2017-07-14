module.exports = function(grunt)
{
	grunt.initConfig(
	{
		i18nc:
		{
			options:
			{
				translatefile: 'dest/translate_data.json'
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
