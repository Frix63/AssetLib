const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const svgDir = path.join(rootDir, 'assets/svg/03_acid_cyber_sigils');
const pngDir = path.join(rootDir, 'assets/png/03_acid_cyber_sigils');
const jsonPath = path.join(rootDir, 'assets/data/categories/03_acid_cyber_sigils.json');
const jsPath = path.join(rootDir, 'assets/data/categories/03_acid_cyber_sigils.js');
const manifestPath = path.join(rootDir, 'manifest.json');

const catData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const col = catData.collections.find(c => c.id === 'spiral_vortexes');
if (!col) throw new Error('spiral_vortexes collection not found');

// Condition for removal:
// Thick ones: w14
// Overlapping ones: arm24
function shouldRemove(name) {
  if (!name.includes('acid_vortex')) return false;
  return name.includes('_w14') || name.includes('_arm24');
}

const removedNames = [];

// 1. Delete files on disk
const svgFiles = fs.readdirSync(svgDir);
for (const file of svgFiles) {
  const name = path.basename(file, '.svg');
  if (shouldRemove(name)) {
    const filePath = path.join(svgDir, file);
    fs.unlinkSync(filePath);
    removedNames.push(name);

    const pngPath = path.join(pngDir, `${name}.png`);
    if (fs.existsSync(pngPath)) {
      fs.unlinkSync(pngPath);
    }
  }
}

console.log(`Deleted ${removedNames.length} SVG & PNG files from disk.`);

// 2. Filter collection items in category JSON
const prevColCount = col.items.length;
col.items = col.items.filter(it => !shouldRemove(it.name));
console.log(`Collection items reduced from ${prevColCount} to ${col.items.length}.`);

// Update collection primary_file if needed
if (shouldRemove(path.basename(col.primary_file || '', '.svg'))) {
  const newPrimary = col.items.find(it => it.name === 'acid_vortex_arm12_t12_w8') || col.items[0];
  col.primary_file = newPrimary.file;
  col.primary_svg = newPrimary.svg;
  console.log(`Updated collection primary_file to ${col.primary_file}`);
}

// Update total count in category data
let totalCatItems = 0;
for (const c of catData.collections) {
  totalCatItems += c.items.length;
}
catData.count = totalCatItems;

// Save category JSON and JS
fs.writeFileSync(jsonPath, JSON.stringify(catData), 'utf8');
fs.writeFileSync(jsPath, `window.ASSET_CHUNKS = window.ASSET_CHUNKS || {};\nwindow.ASSET_CHUNKS["03_acid_cyber_sigils"] = ${JSON.stringify(catData)};\n`, 'utf8');
console.log(`Updated 03_acid_cyber_sigils.json and .js (total category items: ${catData.count}).`);

// 3. Filter manifest.json
const prevManifestCount = manifest.assets.length;
manifest.assets = manifest.assets.filter(a => !shouldRemove(a.name));
console.log(`Manifest assets reduced from ${prevManifestCount} to ${manifest.assets.length}.`);
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log(`Updated manifest.json.`);
