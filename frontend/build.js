const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  outfile: 'dist/bundle.js',
  loader: { '.js': 'jsx' }, 
  minify: true,
  sourcemap: true,
}).catch(() => process.exit(1));
