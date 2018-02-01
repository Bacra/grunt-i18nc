module.exports = function(grunt)
{
	grunt.initConfig(
	{
		i18nc:
		{
			options:
			{
				isIgnoreScanWarn	: true,
				dbTranslateWords	: require('./files/translate_data.json'),
			},
			test:
			{
				src: '*.js',
				cwd: 'files/',
				dest: 'tmp/',
				filter: 'isFile',
				expand: true
			}
		},
		'i18nc-po':
		{
			all:
			{
				output: __dirname+'/tmp/'
			}
		}
	});

	grunt.loadTasks('../tasks');
	grunt.registerTask('default', ['i18nc', 'i18nc-po']);
};
