const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else if (exists) {
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

console.log('Copying data and svg assets to dist and public...');

// 1. Copy manifest.json to dist and public
const manifestSrc = path.join(rootDir, 'manifest.json');
if (fs.existsSync(manifestSrc)) {
  fs.copyFileSync(manifestSrc, path.join(distDir, 'manifest.json'));
  fs.copyFileSync(manifestSrc, path.join(publicDir, 'manifest.json'));
}

// 2. Copy assets/data to dist/assets/data and public/assets/data
const dataSrc = path.join(rootDir, 'assets/data');
if (fs.existsSync(dataSrc)) {
  copyRecursiveSync(dataSrc, path.join(distDir, 'assets/data'));
  copyRecursiveSync(dataSrc, path.join(publicDir, 'assets/data'));
}

// 3. Copy assets/svg to dist/assets/svg and public/assets/svg
const svgSrc = path.join(rootDir, 'assets/svg');
if (fs.existsSync(svgSrc)) {
  copyRecursiveSync(svgSrc, path.join(distDir, 'assets/svg'));
}

console.log('✓ Asset copy completed.');
