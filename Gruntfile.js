module.exports = function(grunt) {
    grunt.initConfig({
        browserify: {
            options: {
                debug: true
            },
            deconinjected: {
                src: ['node_modules/d3-deconstructor/js/injected.js'],
                dest: 'dist/injected.js'
            },
	        restylinginjected: {
	            src: ['js/injected.js'],
                dest: 'dist/restyling-injected.js'
	        },
            ngapp: {
                src: ['js/app.js'],
                dest: 'dist/app.js'
            }
        },
        watch: {
            scripts: {
                files: ['js/**/*.js'],
                tasks: ['browserify'],
                options: {
                    spawn: false,
                    interrupt: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
};
