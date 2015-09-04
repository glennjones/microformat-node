

module.exports = function( grunt ) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		meta: {
			banner: '/*\n   <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n' +
			'   Built: <%= grunt.template.today("yyyy-mm-dd hh:mm") %> - ' + '<%= pkg.homepage %>\n' +
			'   Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
			'   Licensed <%= pkg.license %> \n*/\n\n\n',
			version: '	modules.version = \'<%= pkg.version %>\';'
		},
		buildfile: {
			version: {
				dest: 'lib/version.js',
				content: '<%= meta.version %>'
			}
		},
		example: {
		    'compiled.js': ['lib/*.js'],
		},
		concat: {
			dist: {
				options: {
					banner: '<%= meta.banner %>',
					process: function(src, filename) {
					  console.log(filename);
					  if(filename.indexOf('maps') > -1){
						  src = src.replace('modules.maps = (modules.maps)? modules.maps : {};','');  
					  }
					  if(filename.indexOf('wrap') === -1){
						  src = src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '');
						  src = src.replace('var Modules = (function (modules) {','');
						  src = src.replace('return modules;','');
						  src = src.replace('} (Modules || {}));','');
						  if(src.indexOf('*/') > -1){
						  	src = '\n	' + src.substr(src.indexOf('*/')+2).trim() + '\n';
						  }
					  }
					  return src;
			        },
				},
				files:{
					'index.js': [
						'lib/wrap-start.js', 
						'lib/version.js',
						'node_modules/microformat-shiv/lib/living-standard.js',
						'node_modules/microformat-shiv/lib/parser.js',
						'node_modules/microformat-shiv/lib/parser-implied.js', 
						'node_modules/microformat-shiv/lib/parser-includes.js', 
						'node_modules/microformat-shiv/lib/parser-rels.js', 
						'node_modules/microformat-shiv/lib/utilities.js', 
						'lib/domutils.js',
						'node_modules/microformat-shiv/lib/url.js',
						'node_modules/microformat-shiv/lib/isodate.js',
						'node_modules/microformat-shiv/lib/dates.js',
						'node_modules/microformat-shiv/lib/text.js',
						'node_modules/microformat-shiv/lib/html.js',
						'node_modules/microformat-shiv/lib/maps/*.js',
						'lib/wrap-end.js', 
					]
				}
			}
		},
		jshint: {
			files: ['lib/**/*.js','Gruntfile.js','index.js'],
			options: {
				curly: true,
				eqeqeq: true,
				latedef: true,
				noarg: true,
				undef: true,
				unused: true,
				boss: true,
				eqnull: true,
				browser: true,
				node: true,
				quotmark: 'single',
				moz: true,
				predef: [ 'Microformats', 'define', 'modules', 'URI' ]
			},
			globals: {}
		},
		mocha_phantomjs: {
			options:{
	      		'reporter': 'list',
			},
		    all: ['test/mocha-tests.html']
		},
		watch: {
			files: ['lib/**/*.js','node_modules/microformat-shiv/lib/**/*.js','Gruntfile.js','package.json'],
			tasks: ['buildfile', 'concat:dist']
		}
	});


 	// These plugins provide necessary tasks.
  	grunt.loadNpmTasks('grunt-contrib-jshint');
  	grunt.loadNpmTasks('grunt-contrib-copy');
  	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');



	// very simple files creator
	grunt.task.registerMultiTask('buildfile', function() {
	    grunt.file.write(this.data.dest, this.data.content, {encoding: 'utf8'});
		grunt.log.writeln('File ' + this.data.dest +  'created');
	});


	// Default task.
	grunt.registerTask( 'default', ['buildfile', 'concat:dist']);

	
	
	


};