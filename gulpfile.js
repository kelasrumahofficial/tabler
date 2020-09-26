const gulp = require('gulp'),
	glob = require('glob'),
	sass = require('gulp-sass'),
	postcss = require('gulp-postcss'),
	del = require('del'),
	autoprefixer = require('gulp-autoprefixer'),
	browserSync = require('browser-sync'),
	fs = require('fs'),
	path = require('path'),
	YAML = require('yaml'),
	cp = require('child_process');

sass.compiler = require('node-sass');


/**
 * SVG icons
 */
const prepareSvgFile = function (svg) {
	return svg.replace(/\n/g, '').replace(/>\s+</g, '><');
};

const generateIconsYml = function (dir, filename) {
	const files = glob.sync(dir);
	let svgList = {};

	files.forEach(function (file) {
		const basename = path.basename(file, '.svg');
		svgList[basename] = prepareSvgFile(fs.readFileSync(file).toString());
	});

	fs.writeFileSync(filename, YAML.stringify(svgList));
};

gulp.task('svg-icons', function (cb) {
	generateIconsYml("./node_modules/tabler-icons/icons/*.svg", './pages/_data/icons-tabler.yml');
	generateIconsYml("./svg/brand/*.svg", './pages/_data/icons-brand.yml');
	cb();
});

gulp.task('sass', function () {
	return gulp.src('scss/{tabler*,demo}.scss')
		.pipe(sass({
			style: 'expanded',
			precision: 7,
			sourceMap: true,
			sourceMapContents: true,
			// importer: require('node-sass-package-importer')
		}))
		.on('error', sass.logError)
		.pipe(postcss([
			require('autoprefixer'),
		]))
		.pipe(gulp.dest('css'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

gulp.task('browser-sync', function () {
	browserSync({
		watch: true,
		server: {
			baseDir: "tmp",
			routes: {
				"/dist/css": "./tmp-dist/css",
				"/dist/js": "./tmp-dist/js",
				"/dist/img": "./img",
				"/node_modules": "./node_modules",
				"/static": "./static",
			}
		},
		open: false,
		host: "localhost",
		notify: false,
		reloadOnRestart: true
	});
});

gulp.task('watch', function (cb) {
	gulp.watch('./scss/**/*.scss', gulp.series('sass'));
	cb();
});

gulp.task('jekyll-watch', function (cb) {
	browserSync.notify('Building Jekyll');
	return cp.spawn('bundle', ['exec', 'jekyll', 'build', '--watch'], { stdio: 'inherit' })
		.on('close', cb);
});

gulp.task('clean', function () {
	return del(['tmp-dist']);
});

gulp.task('clean-build', function () {
	return del(['dist']);
});

gulp.task('develop', gulp.parallel('clean', 'sass', 'jekyll-watch', 'watch', 'browser-sync'));


// "start": "npm-run-all clean css-main js-compile-standalone --parallel browsersync watch",
// "start-incremental": "npm-run-all clean css-main js-compile-standalone --parallel browsersync watch-incremental",
// "build": "BUNDLE=true npm-run-all clean-build html-build css-build js-compile-bundle js-libs-bundle images-copy-build assets-copy-build",
// "build-demo": "BUNDLE=true npm-run-all clean-build html-build-demo css-build js-compile-bundle js-libs-bundle images-copy-build assets-copy-build",
// "bundlesize": "bundlesize",
// "browsersync": "node build/browsersync.js",
// "images-copy-build": "cp -R img/* dist/img/",
// "assets-copy-build": "mkdir -p demo/dist && cp -R dist/* demo/dist/ && mkdir -p demo/static && cp -R static/* demo/static/",
// "html-build": "JEKYLL_ENV=production bundle exec jekyll build --destination demo --trace",
// "html-build-demo": "JEKYLL_ENV=production bundle exec jekyll build --destination demo --config _config.yml,_config-demo.yml",
// "lint": "npm-run-all --parallel js-lint css-lint",
// "clean": "rm -rf tmp-dist && mkdir tmp-dist && mkdir tmp-dist/css && mkdir tmp-dist/js",
// "clean-build": "rm -rf dist && mkdir dist && mkdir dist/css && mkdir dist/js && mkdir dist/img",
// "css": "npm-run-all css-compile",
// "css-build": "npm-run-all css-compile css-prefix-build css-minify-build",
// "css-compile": "node build/scss-compile.js",
// "css-prefix": "postcss --config build/postcss.config.js --replace \"tmp-dist/css/*.css\" \"!tmp-dist/css/*.min.css\"",
// "css-prefix-build": "postcss --config build/postcss.config.js --replace \"dist/css/*.css\" \"!dist/css/*.min.css\"",
// "css-minify": "for i in tmp-dist/css/*.css;do echo $i; N=`echo $i | sed -e 's/^dist\\/css\\///g' | sed -e 's/\\\\.css//g'`; echo $N; cleancss --level 1 --format breakWith=lf --source-map --source-map-inline-sources --output tmp-dist/css/$N.min.css tmp-dist/css/$N.css; done",
// "css-minify-build": "for i in dist/css/*.css;do echo $i; N=`echo $i | sed -e 's/^dist\\/css\\///g' | sed -e 's/\\\\.css//g'`; echo $N; cleancss --level 1 --format breakWith=lf --source-map --source-map-inline-sources --output dist/css/$N.min.css dist/css/$N.css; done",
// "css-lint": "stylelint \"scss/**/*.scss\" --cache --cache-location .cache/.stylelintcache",
// "css-main": "npm-run-all css-compile css-prefix",
// "css-main-build": "npm-run-all css-lint css-compile css-prefix-build css-minify",
// "watch": "npm-run-all --parallel watch-css watch-js watch-html",
// "watch-incremental": "npm-run-all --parallel watch-css watch-js watch-html-incremental",
// "watch-css": "nodemon --watch scss/ --ext scss --exec \"npm run css-main\"",
// "watch-js": "nodemon --watch js/ --ext js --exec \"npm run js-compile-standalone\"",
// "watch-html": "JEKYLL_ENV=development bundle exec jekyll build --watch",
// "watch-html-incremental": "JEKYLL_ENV=development bundle exec jekyll build --watch --incremental",
// "js-libs-bundle": "rm -rf dist/libs && mkdir dist/libs && node build/copy-libs.js",
// "js-lint": "eslint --cache --cache-location .cache/.eslintcache js build/",
// "js-compile-standalone": "rollup --environment BUNDLE:false --config build/rollup.config.js --sourcemap",
// "js-compile-bundle": "rollup --environment BUNDLE:true --config build/rollup.config.js --sourcemap",
// "svg-svgo": "svgo -f svg/brand --pretty",
// "unused-files": "node build/unused-files.js"
