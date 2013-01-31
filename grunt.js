module.exports = function( grunt ) {
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.initConfig({
		lint: {
			files: ['grunt.js', 'lib/*.js', 'lib/maps/*.js']
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true,
				browser: false,
				node: true,
				strict: false,
				quotmark: 'single'
			},
			globals: {}
		},
		mochaTest: {
			files: ['test/*-test.js']
		},
		watch: {
			files: 'lib/*.js',
			tasks: 'mochaTest'
		}
	});
	// Default task.
	grunt.registerTask( 'default', 'mochaTest', 'lint' );
};