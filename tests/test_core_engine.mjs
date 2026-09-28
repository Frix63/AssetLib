import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));

// Import from the built production bundle or we can use tsx/esbuild
// Since Vite bundled dist/assets/index-*.js as ES module, let's find the JS bundle in dist/assets
const distAssets = fs.readdirSync(path.join(rootDir, 'dist', 'assets'));
const jsBundle = distAssets.find(f => f.endsWith('.js'));
console.log(`Found built JS bundle: dist/assets/${jsBundle}`);

// We can also test by importing TypeScript files using ts-node or a lightweight test
// Or let's verify dist bundle loads or verify via node --loader
