import gulp from "gulp";
import run from "gulp-run-command";

import dartSass from "sass";
import gulpSass from "gulp-sass";
const sass = gulpSass(dartSass);

import csso from "gulp-csso";
import include from "gulp-file-include";
import del from "del";
import concat from "gulp-concat";
import sourcemaps from "gulp-sourcemaps";
import autoprefixer from "gulp-autoprefixer";
import prettier from "gulp-prettier";

import merge from "merge-stream";
import fs from "fs";
import path from "path";

import imagemin from "imagemin";
import imageminJpegtran from "imagemin-jpegtran";
import imageminPngquant from "imagemin-pngquant";
import imageminSvgo from "imagemin-svgo";
import imageminGIF from "imagemin-gifsicle";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminWebp from "imagemin-webp";

import sync from "browser-sync";
const browserSync = sync.create();

function getFolders(dir) {
  return fs.readdirSync(dir).filter(function (file) {
    return fs.statSync(path.join(dir, file)).isDirectory();
  });
}

function recursiveGoThroughAllFolders(root, folderName = ``, arr = []) {
  let newFolderName = root;
  if (folderName) {
    newFolderName = `${root}/${folderName}`;
    root = newFolderName;
  }

  arr.push(root);
  const childrenFolders = getFolders(newFolderName);
  if (childrenFolders) {
    childrenFolders.forEach((folder) => {
      recursiveGoThroughAllFolders(root, folder, arr);
    });
  }
  return arr;
}

function html() {
  return gulp
    .src("src/**.html")
    .pipe(
      include({
        prefix: "@@",
        basepath: "@file",
      })
    )
    .pipe(gulp.dest("docs"));
}
function htmlFormat() {
  return gulp
    .src("src/**.html")
    .pipe(
      include({
        prefix: "@@",
        basepath: "@file",
      })
    )
    .pipe(prettier({ singleQuote: true }))
    .pipe(gulp.dest("docs"));
}

function js() {
  return gulp.src("src/js/**/*.js").pipe(gulp.dest("docs/js"));
}

function minimizeFolder(folder) {
  (async () => {
    await imagemin([`${folder}/*.svg`], {
      destination: `docs/${folder.substring(4)}`,
      plugins: [
        imageminSvgo({
          plugins: [
            {
              name: "removeViewBox",
              active: false,
            },
          ],
        }),
      ],
    });
  })();

  (async () => {
    await imagemin([`${folder}/*.{jpg,jpeg}`], {
      destination: `docs/${folder.substring(4)}`,
      plugins: [imageminJpegtran()],
    });
  })();

  (async () => {
    await imagemin([`${folder}/*.png`], {
      destination: `docs/${folder.substring(4)}`,
      plugins: [imageminPngquant()],
    });
  })();

  (async () => {
    await imagemin([`${folder}/*.gif`], {
      destination: `docs/${folder.substring(4)}`,
      plugins: [imageminGIF()],
    });
  })();

  // (async () => {
  //   await imagemin([`${folder}/*.{jpg,jpeg,png}`], {
  //     destination: `docs/${folder.substring(4)}`,
  //     plugins: [imageminWebp({ quality: 50 })],
  //   });

  //   console.log("WebP optimized");
  // })();
}

function imagesWithMinifier(done) {
  let allFolders = recursiveGoThroughAllFolders(`src/images`);
  console.log(allFolders);
  allFolders.forEach((elem) => {
    minimizeFolder(elem);
  });

  done();
}

function images() {
  return gulp.src("src/images/**/*").pipe(gulp.dest("docs/images"));
}

function fonts() {
  return gulp
    .src("src/fonts/*.+(ttf|otf|eof|svg|woff|woff2)")
    .pipe(gulp.dest("docs/fonts"));
}

function css() {
  return gulp.src("src/css/**/*.css").pipe(gulp.dest("docs/css"));
}

function scssFileMove() {
  return gulp.src("src/scss/**/*.scss").pipe(gulp.dest("docs/scss"));
}

function Lottie() {
  return gulp.src("src/js/lottie/**.json").pipe(gulp.dest("docs/js/lottie"));
}

function scss() {
  return gulp
    .src("src/scss/style.scss")
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 2 versions"],
      })
    )
    .pipe(csso())
    .pipe(concat("style.css"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("docs/css"));
}

function Clear() {
  return del("docs");
}

function Serve() {
  browserSync.init({
    server: "./docs",
    // uncomment if you don't have internet connection
    // online: false
  });

  gulp.watch("src/**.html", gulp.series(html)).on("change", browserSync.reload);

  gulp
    .watch("src/html/**/*.html", gulp.series(html))
    .on("change", browserSync.reload);

  gulp
    .watch("src/scss/**/*.scss", gulp.series(scss))
    .on("change", browserSync.reload);

  gulp
    .watch("src/css/**/*.css", gulp.series(css))
    .on("change", browserSync.reload);

  gulp
    .watch("src/images/**/*", gulp.series(images))
    .on("change", browserSync.reload);
  gulp
    .watch("src/fonts/**", gulp.series(fonts))
    .on("change", browserSync.reload);
  gulp.watch("src/js/**.js", gulp.series(js)).on("change", browserSync.reload);
  gulp
    .watch("src/js/lottie/**.json", gulp.series(Lottie))
    .on("change", browserSync.reload);
}

export const build = gulp.series(
  Clear,
  imagesWithMinifier,
  fonts,
  css,
  scssFileMove,
  js,
  Lottie,
  scss,
  htmlFormat
);
export const serve = gulp.series(
  Clear,
  images,
  fonts,
  css,
  scssFileMove,
  js,
  Lottie,
  scss,
  html,
  Serve
);
export const clear = Clear;
