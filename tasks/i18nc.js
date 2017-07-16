var i18nc = require('i18nc');


module.exports = function(grunt)
{
	grunt.registerMultiTask('i18nc', 'i18nc', function()
	{
		var self = this;
		var options = self.options();
		var translatefile = options.translatefile;

		var translateData = {};
		var translateAllData;
		var translateTaskAllData
		if (translatefile && grunt.file.isFile(translatefile))
		{
			try {
				translateAllData = grunt.file.readJSON(translatefile);
			}
			catch(err)
			{
				grunt.file.copy(translatefile, translatefile+'.bak_'+self.target);
				grunt.log.warn('read translatefile err: '.red + translatefile);
			}
		}

		if (!translateAllData || typeof translateAllData != 'object')
		{
			translateAllData = {};
			translateTaskAllData = (translateAllData[self.target] = {});
		}
		else
		{
			translateTaskAllData = translateAllData[self.target]
				|| (translateAllData[self.target] = {});
		}

		var specialWords = [];
		self.files.forEach(function(file)
		{
			var newfile = file.src[0];
			var oldfile = file.dest;

			if (!grunt.file.isFile(newfile)) return;

			var content = grunt.file.read(newfile);
			var opts = grunt.util._.extend(options,
					{
						defaultFilekey: newfile,
						translateAllData: translateTaskAllData,
					});

			var info = i18nc(content, opts);

			if (info.dirtyWords.length)
			{
				grunt.log.warn('Dirty words call I18N Function:\n  '+info.dirtyWords.join('  \n'));
			}
			specialWords = grunt.util._.uniq(specialWords.concat(info.specialWords));

			grunt.file.write(oldfile, info.code);

			// 保存数据，每次处理完都保存
			// 避免报错导致数据丢失
			if (translatefile)
			{
				var keys = {};
				specialWords.forEach(function(key)
				{
					keys[key] = '';
				});

				translateTaskAllData.default_json = grunt.util._.extend(keys, translateTaskAllData.default_json);

				grunt.file.write(translatefile, JSON.stringify(translateAllData, null, '\t'));
			}
		});
	});
};
