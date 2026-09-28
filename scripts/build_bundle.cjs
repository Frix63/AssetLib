const fs = require('fs');
const path = require('path');
const { ZipArchive } = require('archiver');

const rootDir = path.resolve(__dirname, '..');
const downloadsDir = path.join(rootDir, 'public/downloads');
const svgDir = path.join(rootDir, 'assets/svg');

if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

const zipPath = path.join(downloadsDir, 'AssetLib-Vectors.zip');
const output = fs.createWriteStream(zipPath);
const archive = new ZipArchive({
  zlib: { level: 9 } // Maximum compression
});

output.on('close', () => {
  const sizeMb = (archive.pointer() / (1024 * 1024)).toFixed(2);
  const legacyZip = path.join(downloadsDir, 'AssetLib-Master-Bundle.zip');
  fs.copyFileSync(zipPath, legacyZip);
  console.log(`Successfully built AssetLib-Vectors.zip (${sizeMb} MB) at ${zipPath}`);
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn('Archiver warning:', err);
  } else {
    throw err;
  }
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Add README.txt
const readmeContent = `ASSETLIB MASTER VECTOR BUNDLE
==============================
Total Assets: 2,069 Curated Procedural Vector SVGs
License: Creative Commons Zero (CC0 1.0 Universal)
Website: https://assetlib.dev

100% Free for personal and commercial projects. No attribution required.

Categories Included:
- 01_y2k_cyber_stars (Y2K Cyber Stars & Lens Sparkles)
- 02_brutalist_hud (Brutalist HUD Reticles & Target Dials)
- 03_acid_cyber_sigils (Acid Graphics & Cyber Sigils)
- 04_bauhaus_swiss (Bauhaus & Swiss Modernist Geometries)
- 05_organic_botanical (Fluid Blobs & Botanical Leaves)
- 06_retro_groovy (70s Retro Groovy Pop & Badges)
- 07_memphis_pop (Memphis 80s Postmodern Accents)
- 08_badges_seals (Award Seals, Stamps & Ribbons)
- 09_arrows_accents (Brutalist Arrows & Accents)
- 10_sacred_guilloche (Sacred Geometry & Guilloche Spirals)
- 11_halftones (Halftone Dot Screens & Matrices)
- 12_abstract_distortions (Wave Distortions & String Art)

Created with AssetLib (https://assetlib.dev).
`;
archive.append(readmeContent, { name: 'README.txt' });

// Add LICENSE.txt
const licenseContent = `Creative Commons Legal Code
CC0 1.0 Universal (CC0 1.0) Public Domain Dedication

The person who associated a work with this deed has dedicated the work to the public domain by waiving all of his or her rights to the work worldwide under copyright law, including all related and neighboring rights, to the extent allowed by law.

You can copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission.
`;
archive.append(licenseContent, { name: 'LICENSE.txt' });

// Add all SVG files preserving category directory hierarchy
if (fs.existsSync(svgDir)) {
  const catDirs = fs.readdirSync(svgDir);
  for (const cat of catDirs) {
    const fullCatPath = path.join(svgDir, cat);
    if (fs.statSync(fullCatPath).isDirectory()) {
      archive.directory(fullCatPath, cat);
    }
  }
}

archive.finalize();
