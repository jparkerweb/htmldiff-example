var args = require('yargs').argv
	browserSync = require('browser-sync');

var gulp = require('gulp');

var notify = require('gulp-notify'),
	gutil = require('gulp-util'),
	gulpif = require('gulp-if'),
	clean = require('gulp-clean'),
	watch = require('gulp-watch'),
	rubySass = require('gulp-ruby-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	csso = require('gulp-csso'),
	webpack = require('gulp-webpack'),
	uglify = require('gulp-uglify');


// gather command line args
var buildOnly = args.build;


// setup Path variables
var sourcePaths = {
	CSS: '../src/scss/**/*.scss',
	JS: '../src/js/**/*.js',
	JSBase: '../src/js'
};
var destPaths = {
	CSS: '../css',
	JS: '../js'
};


// Static server
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "../"
        }
    });
});
// reload
gulp.task('reload', function () {
	console.log('browser-sync reload');
	browserSync.reload();
});


// task: SASS
gulp.task('sass', ['clean-sass'], function () {
	gulp.start('build-sass');
});
	// clean our build path
	gulp.task('clean-sass', function () {  
		return gulp.src([
				destPaths.CSS + '/**/*.css'
			], {read: false})
			.pipe(clean({force: true}));
	});
	// task: compile SASS to CSS and AutoPrefix
	gulp.task('build-sass', function () {
		console.log("builidng sass");
		browserSync.notify("Compiling CSS, please wait...");
		// set sass complete message
		var sassCompleteMessage = "SASS Complete";
		if (buildOnly) {
			sassCompleteMessage = sassCompleteMessage + " : MINIFIED";
		}

		return gulp.src(sourcePaths.CSS)
			.pipe(rubySass()).on('error', notify.onError({message: 'sass error: <%= error %>'}))
			.pipe(autoprefixer('last 4 versions'))
			.pipe(gulpif(buildOnly, csso()))
			.pipe(gulp.dest(destPaths.CSS))
			.pipe(notify({onLast: true, message: sassCompleteMessage}))
			.pipe(browserSync.reload({stream:true}));
	});


// task: scripts
gulp.task('scripts', ['clean-scripts'], function () {
	gulp.start('webpack');
});
	// clean our build path
	gulp.task('clean-scripts', function () { 
		return gulp.src([
				destPaths.JS + '/**/*.js', '!' + destPaths.JS + '/libs/*.js'
			], {read: false})
			.pipe(clean({force: true}));
	});
	// task: Run Javascript files through Webpack
	gulp.task('webpack', function() {
		console.log(sourcePaths.JSBase + '/app.js');
	    return gulp.src([sourcePaths.JSBase + '/app.js'])
	        .pipe(webpack({
	        	output: { filename: "index.js" }
	        }))
			.pipe(gulpif(buildOnly, uglify()))
			.pipe(gulp.dest(destPaths.JS))
	});
	gulp.task('scripts-watch', ['scripts'], function () {
		gulp.start('reload');
	});


// task: watch directories/files for change
gulp.task('watch', function () {
	gulp.watch(sourcePaths.CSS, ['sass']);
	gulp.watch(sourcePaths.JS, ['scripts-watch']);
	gulp.watch('../*.html', ['reload'])
});


// task: default, clean, compile, watch.
gulp.task('default', ['sass', 'scripts'], function () {
	if (!buildOnly) gulp.start('watch');
	if (!buildOnly) gulp.start('browser-sync');
});