var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var rename = require('gulp-rename');
var del = require('del');
var sass = require('gulp-sass');

var scriptsPath = 'modules';

function getFolders(dir) {
    return fs.readdirSync(dir)
        .filter(function(file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
}

gulp.task('clean', function () {
    // You can use multiple globbing patterns as you would with `gulp.src`
    return del(['public/modules/**/*.*' ]);
});

gulp.task('sass', function () {
    var folders = getFolders(scriptsPath);

    var tasks = folders.map(function( folder ) {
        var pathConfigs = {
            ENTRY_POINT: path.join(scriptsPath, folder, '/assets/scss/*.scss'),
            DEST: 'public/css'
        };

        console.log( " Path Configs: ", pathConfigs );

        gulp.src( pathConfigs.ENTRY_POINT )
            .pipe(sass.sync().on('error', sass.logError))
            .pipe(gulp.dest( pathConfigs.DEST ));
    });

    return tasks;
});

gulp.task('concatMini', function () {
    var folders = getFolders(scriptsPath);

    var tasks = folders.map(function( folder ) {
        var pathConfigs = {
            ENTRY_POINT: path.join(scriptsPath, folder, '/**/*.js'),
            OUT: 'app-' + folder + '-0.0.1.js',
            MINIFIED_OUT: 'app-' + folder + '-0.0.1.min.js',
            DEST: 'public/js'
        };

        console.log( " Path Configs: ", pathConfigs );

        gulp.src([ pathConfigs.ENTRY_POINT ])
            .pipe(concat(pathConfigs.OUT))
            .pipe(gulp.dest(pathConfigs.DEST))
            .pipe(streamify(uglify()))
            .pipe(rename(pathConfigs.MINIFIED_OUT))
            .pipe(gulp.dest(pathConfigs.DEST))
        ;
    });

    return tasks;
});

gulp.task('build', ['sass', 'concatMini']);
gulp.task('default', ['clean', 'build']);