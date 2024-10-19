const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.copyFileSync('templates/index.html', 'dist/index.html');

esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  outfile: 'dist/bundle.js',
  loader: { '.js': 'jsx' }, 
  minify: true,
  sourcemap: true,
}).catch(() => process.exit(1));
