import gulp from 'gulp';
import log from 'fancy-log';
import rename from 'gulp-rename';
import ejs from 'gulp-ejs';
import htmlmin from 'gulp-htmlmin';
import webpack from 'webpack-stream';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import webpackconfig from './webpack.config.js';

const { src, dest, watch, series, parallel } = gulp;
const sass = gulpSass(dartSass);

const src_dir = './src/';
const pub_dir = './public/';

const htmlminopts = {
    collapse_boolean_attributes: true,
    collapse_whitespace: true,
    minify_css: true,
    minify_js: true,
    minify_urls: true,
    remove_empty_attributes: true,
    remove_redundant_attributes: true,
    remove_script_type_attributes: true,
    remove_style_link_type_attributes: true,
    sort_attributes: true,
    sort_class_name: true
};

const path_to = (from, where) => {
    if (from.endsWith('/')) {
        from = from.slice(0, -1);
    }
    if (where.startsWith('/')) {
        where = where.slice(1);
    }

    return `${from}/${where}`;
};

const src_path_to = (where) => {
    return path_to(src_dir, where);
};

const pub_path_to = (where) => {
    return path_to(pub_dir, where);
};

const glob_pattern = (dir, ext) => {
    if (ext === '') {
        ext = dir;
    }
    return `${dir}/**/*.${ext}`;
};

const src_glob = (dir, ext = '') => {
    return src_path_to(glob_pattern(dir, ext));
};

const transform_ejs = (cb) => {
    src([src_glob('ejs'), '!' + src_glob('ejs/includes', 'ejs')])
        .pipe(ejs({}))
        .on('error', log)
        .pipe(rename({ extname: '.html' }))
        .pipe(htmlmin(htmlminopts))
        .pipe(dest(pub_dir));
    cb();
};

const transform_modules = (cb) => {
    src(src_dir)
        .pipe(webpack(webpackconfig))
        .pipe(dest(pub_path_to('dist')));
    cb();
};

const transform_sass = (cb) => {
    src(src_glob('scss'))
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(rename({ extname: '.css' }))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(dest(pub_path_to('dist')));
    cb();
};

const transform_public = (cb) => {
    src(src_glob('public', '*')).pipe(dest(pub_dir));
    cb();
};

export const task_build = parallel(
    transform_ejs,
    transform_modules,
    transform_sass,
    transform_public
);

export const task_watch = (cb) => {
    watch(src_glob('ejs'), transform_ejs);
    watch(src_glob('mjs'), transform_modules);
    watch(src_glob('scss'), transform_sass);
    watch(src_glob('public', '*'), transform_public);
    cb();
};

export default series(task_build, task_watch);