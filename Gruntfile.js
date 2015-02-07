module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: grunt.file.readJSON('config.json'),
        env: grunt.file.readJSON('env.json'),
        connect: {
          dev: {
            options: {
              port: '<%= config.Port %>',
              //keepalive: true, keeping grunt running
              livereload:true,
              base: '<%= config.devFolder %>/',
              open: {
                target: 'http://localhost:<%= config.Port %>',
                appName: 'Google Chrome',
              }
            }
          },
          stage:{
            options: {
              port: '<%= config.Port %>',
              //keepalive: true, keeping grunt running
              livereload:true,
              base: '<%= config.distFolder %>/',
              open: {
                target: 'http://localhost:<%= config.Port %>',
                appName: 'Google Chrome',
              }
            }
          }
        },
        watch: {
          js: {
            files: ['<%= config.devFolder %>/fireadmin.js'],
            tasks:['jsdoc'],
            options:{
              livereload:{
                port:35739
              },
            }
          }
        },
        aws_s3:{
          production:{
            options: {
              accessKeyId: '<%= env.AWSAccessKeyId %>',
              secretAccessKey: '<%= env.AWSSecretKey %>',
              bucket:'<%= env.Bucket %>',
              uploadConcurrency: 30
            },
            files:[
              {'action': 'upload', expand: true, cwd: '<%= config.distFolder %>', src: ['**'], dest: '<%= env.BucketFolder %>/<%= pkg.version %>', differential:true},
              {'action': 'upload', expand: true, cwd: '<%= config.distFolder %>', src: ['**'], dest: '<%= env.BucketFolder %>/current', differential:true}
            ]
          },
          stageDocs:{
            options: {
              accessKeyId: '<%= env.AWSAccessKeyId %>',
              secretAccessKey: '<%= env.AWSSecretKey %>',
              bucket:'<%= env.Bucket %>',
              uploadConcurrency: 30
            },
            files:[
              {'action': 'upload', expand: true, cwd: '<%= config.distFolder %>/docs', src: ['**'], dest: '<%= env.BucketFolder %>/staging/docs', differential:true}
            ]
          }
        },
        copy: {
          dist: {
            files: [
              {expand: true, cwd: './<%= config.devFolder %>', src:'**', dest: '<%= config.distFolder %>'}
            ],
          },
        },
        uglify:{
          options:{
            compress:{
              drop_console:true
            }
          },
          dist:{
            files:{
              '<%= config.distFolder %>/fireadmin.min.js': ['<%= config.devFolder %>/fireadmin.js']
            }
          }
        },
        jsdoc: {
          dev:{
            src: ['<%= config.devFolder %>/fireadmin.js'],
            options: {
              destination: '<%= config.distFolder %>/docs',
              template:'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template',
              configure : "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template/jsdoc.conf.json"
            }
          }
        },
        bump:{
          options:{
            files:['package.json'],
            updateConfigs:['pkg'],
            commit:true,
            commitMessage:'[RELEASE] Release v%VERSION%',
            commitFiles:['-a'],
            createTag:true,
            tagName:'v%VERSION%',
            push:true,
            pushTo:'origin',
            gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
            globalReplace: false
          }
        },
        'closure-compiler': {
          frontend: {
            closurePath: '<%= env.CLOSURE_PATH %>'||'node_modules/closure/closure.js',
            js: '<%= config.devFolder %>/**/*.js',
            jsOutputFile: '<%= config.distFolder %>/fireadmin.min.js',
            maxBuffer: 500,
            options: {
              compilation_level: 'ADVANCED_OPTIMIZATIONS',
              language_in: 'ECMASCRIPT5_STRICT'
            }
          }
        },
        closureDepsWriter: {
          options: {
            // [REQUIRED] To find the depswriter executable we need either the path to
            //    closure library or the depswriter executable full path:
            closureLibraryPath: '../closure-library',

            // [OPTIONAL] Root directory to scan. Can be string or array
            root: ['<%= config.devFolder %>'],
          },
          targetName: {
            src:'deps.js',
            dest:'dev/fa-deps.js'
          }
        }

    });
    // Default task(s).
    grunt.registerTask('default', [ 'connect:dev', 'watch']);
    //Documentation, minify js, minify html
    grunt.registerTask('build', ['jsdoc', 'copy','uglify']);

    grunt.registerTask('docs', ['jsdoc', 'aws_s3:stageDocs']);

    grunt.registerTask('test', ['jsdoc', 'uglify', 'copy', 'connect:stage', 'watch']);

    grunt.registerTask('stage', ['build', 'copy', 'aws_s3:stage']);

    grunt.registerTask('release', ['bump-only:prerelease','stage', 'bump-commit', 'aws_s3:production']);

};
