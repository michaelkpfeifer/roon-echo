const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.copyFileSync('template/index.html', 'dist/index.html');
fs.copyFileSync('template/favicon.ico', 'dist/favicon.ico');

esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  outfile: 'dist/bundle.js',
  loader: { '.js': 'jsx' },
  minify: true,
  sourcemap: true,
}).catch(() => process.exit(1));
