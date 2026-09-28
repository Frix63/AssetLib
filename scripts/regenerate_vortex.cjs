const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const CENTER = 256;

function generateVortexPath(arms, turns, strokeW) {
  const rMax = Math.max(60, 216 - strokeW / 2);
  const rMin = Math.max(14, (arms * strokeW) / (2 * Math.PI * 1.35));
  const ptsPerArm = 72;
  const angleStep = (2 * Math.PI) / arms;
  const cmds = [];

  for (let arm = 0; arm < arms; arm++) {
    const baseAngle = arm * angleStep;
    for (let step = 0; step < ptsPerArm; step++) {
      const t = step / (ptsPerArm - 1);
      const r = rMin + (rMax - rMin) * Math.pow(t, 0.75);
      const theta = baseAngle + t * turns * 2 * Math.PI;
      const x = CENTER + r * Math.cos(theta);
      const y = CENTER + r * Math.sin(theta);
      if (step === 0) {
        cmds.push(`M ${x.toFixed(2)} ${y.toFixed(2)}`);
      } else {
        cmds.push(`L ${x.toFixed(2)} ${y.toFixed(2)}`);
      }
    }
  }

  return cmds.join(' ');
}

function buildSvg(arms, turns, strokeW) {
  const d = generateVortexPath(arms, turns, strokeW);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" fill="none" data-title="Hyperspace Spiral Vortex" data-category="03_acid_cyber_sigils" data-tags="acid,vortex,spiral,warp,hyperspace">\n  <title>Hyperspace Spiral Vortex</title>\n  <path d="${d}" fill="none" stroke="currentColor" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round" fill-rule="evenodd" />\n</svg>`;
}

const armsList = [4, 6, 8, 12, 16, 24];
const turnsMap = { 4: 0.4, 8: 0.8, 12: 1.2, 18: 1.8 };
const strokeWeights = [4, 8, 14];

let count = 0;
const rootDir = path.resolve(__dirname, '..');
const svgDir = path.join(rootDir, 'assets/svg/03_acid_cyber_sigils');
const pngDir = path.join(rootDir, 'assets/png/03_acid_cyber_sigils');

const jsonPath = path.join(rootDir, 'assets/data/categories/03_acid_cyber_sigils.json');
const jsPath = path.join(rootDir, 'assets/data/categories/03_acid_cyber_sigils.js');
const manifestPath = path.join(rootDir, 'manifest.json');

const catData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const col = catData.collections.find(c => c.id === 'spiral_vortexes');
if (!col) throw new Error('spiral_vortexes collection not found!');

const svgMap = {};

for (const arms of armsList) {
  for (const [tKey, turns] of Object.entries(turnsMap)) {
    for (const sw of strokeWeights) {
      const name = `acid_vortex_arm${arms}_t${tKey}_w${sw}`;
      const svg = buildSvg(arms, turns, sw);
      svgMap[name] = svg;

      // 1. Write SVG file
      const svgFile = path.join(svgDir, `${name}.svg`);
      fs.writeFileSync(svgFile, svg, 'utf8');

      // 2. Render PNG with resvg
      const resvg = new Resvg(svg, {
        fitTo: { mode: 'width', value: 512 },
        background: 'rgba(0, 0, 0, 0)',
        shapeRendering: 2
      });
      const png = resvg.render().asPng();
      const pngFile = path.join(pngDir, `${name}.png`);
      fs.writeFileSync(pngFile, png);

      count++;
    }
  }
}

console.log(`Regenerated ${count} SVG and PNG vortex assets.`);

// Update collection items in catData
for (const item of col.items) {
  if (svgMap[item.name]) {
    item.svg = svgMap[item.name];
  }
}
if (col.primary_file) {
  const pName = path.basename(col.primary_file, '.svg');
  if (svgMap[pName]) {
    col.primary_svg = svgMap[pName];
  }
}

// Write back category JSON and JS
fs.writeFileSync(jsonPath, JSON.stringify(catData), 'utf8');
fs.writeFileSync(jsPath, `window.ASSET_CHUNKS = window.ASSET_CHUNKS || {};\nwindow.ASSET_CHUNKS["03_acid_cyber_sigils"] = ${JSON.stringify(catData)};\n`, 'utf8');
console.log('Updated 03_acid_cyber_sigils.json and .js');

// Update manifest
let manifestUpdated = 0;
for (const a of manifest.assets) {
  if (svgMap[a.name]) {
    a.svg = svgMap[a.name];
    manifestUpdated++;
  }
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log(`Updated ${manifestUpdated} assets in manifest.json.`);
