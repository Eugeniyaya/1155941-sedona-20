const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const del=require("del");
const imagemin=require("gulp-imagemin");
const webp=require("gulp-webp");
const svgstore = require("gulp-svgstore");



// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("styles.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", sync.reload);
}

exports.default = gulp.series(
  styles, server, watcher
);

// Copy

const copy = () => {
  return gulp.src([
  "source/fonts/**/*.{woff,woff2}",
  "source/img/**",
  "source/js/**",
  "source/*.ico"
  ], {
  base: "source"
  })
  .pipe(gulp.dest("build"))
};

exports.copy = copy;

//Clean

const clean = () => {
  return del("build");
};

exports.clean = clean;

// Html

const html= () => {
  return gulp.src ("source/*.html")
  .pipe(gulp.dest("build"));
}
exports.html = html;

// Build

const build = gulp.series(clean, copy, styles, html);
exports.build = build;

const start = gulp.series(build, server);
exports.start = start;

// Images opimization

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
  .pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.mozjpeg({quality: 75, progressive: true}),
    imagemin.optipng({optimizationLevel: 5}),
    imagemin.svgo({
        plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
        ]
    })
]))
}
 exports.images = images;

// Images WebP

const createWebp = () => {
  return gulp.src("source/img/**/*.{png,jpg}")
  .pipe(webp({quality: 90}))
  .pipe(gulp.dest("source/img"))
 }
 exports.webp = createWebp;

 //  Sprites icon-  svg

const sprite = () => {
  return gulp.src("source/img/**/icon-*.svg")
 .pipe(svgstore())
 .pipe(rename("sprite.svg"))
 .pipe(gulp.dest("source/img"))
}
exports.sprite = sprite;

