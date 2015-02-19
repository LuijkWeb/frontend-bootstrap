
var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    del = require('del'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    less = require('gulp-less'),
    bower = require('gulp-bower'),
    fileinclude = require('gulp-file-include'),
    reload = browserSync.reload;

gulp.task('bower', function () {
    return bower()
        .pipe(gulp.dest('src/vendor'))
        .pipe(gulp.dest('dist/vendor'));
});

// Optimize Images
gulp.task('images:assets', function () {
    return gulp.src('src/assets/img/**/*')
        .pipe($.imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest('dist/assets/img'))
        .pipe($.size({title: 'images (assets)'}));
});

gulp.task('images:media', function () {
    return gulp.src('src/media/images/**/*')
        .pipe($.imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest('dist/media/images'))
        .pipe($.size({title: 'images (media)'}));
});

gulp.task('images', ['images:assets', 'images:media']);

// Copy Web Fonts To Dist
gulp.task('fonts', function () {
    return gulp.src(['src/assets/fonts/**'])
        .pipe(gulp.dest('dist/assets/fonts'))
        .pipe($.size({title: 'fonts'}));
});

// Compile and Automatically Prefix Stylesheets
gulp.task('styles', function () {
    // For best performance, don't add Sass partials to `gulp.src`
    return gulp.src('src/assets/less/main.less')
        .pipe(less()
            .on('error', console.error.bind(console))
    )
        .pipe(gulp.dest('.tmp/assets/css'))
        // Concatenate And Minify Styles
        .pipe($.if('*.css', $.csso()))
        .pipe(gulp.dest('dist/assets/css'))
        .pipe($.size({title: 'styles'}));
});

//  Scan Your HTML For Partials & Include Them
gulp.task('html:partials', function () {
    return gulp.src('src/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('.tmp'));
});

// Scan Your HTML For Assets & Optimize Them
gulp.task('html:assets', function () {
    var assets = $.useref.assets({searchPath: '{.tmp,src}'});

    return gulp.src('.tmp/*.html')
        .pipe(assets)
        // Concatenate And Minify JavaScript
        .pipe($.if('*.js', $.uglify({preserveComments: 'some'})))
        // Concatenate And Minify Styles
        // In case you are still using useref build blocks
        .pipe($.if('*.css', $.csso()))
        .pipe(assets.restore())
        .pipe($.useref())
        // Minify Any HTML
        //.pipe($.if('*.html', $.minifyHtml()))
        // Output Files
        .pipe(gulp.dest('dist'))
        .pipe($.size({title: 'html'}));
});

gulp.task('html', function() {
    runSequence('html:partials', 'html:assets');
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

// Watch Files For Changes & Reload
gulp.task('serve', ['default'], function () {
    browserSync({
        notify: false,
        server: ['.tmp', 'src']
    });

    gulp.watch(['src/**/*.html'], ['html', reload]);
    gulp.watch(['src/assets/less/**/*.less'], ['styles', reload]);
    gulp.watch(['src/assets/images/**/*'], reload);
    gulp.watch(['src/media/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function () {
    browserSync({
        notify: false,
        server: 'dist'
    });
});

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function(cb) {
    runSequence('bower', 'styles', 'html', 'images', 'fonts', cb);
});