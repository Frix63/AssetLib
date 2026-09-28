const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));

// Extract the script, excluding the trailing init();
const scriptStart = html.indexOf('<script>') + 8;
const scriptEnd = html.lastIndexOf('init();');
let script = html.substring(scriptStart, scriptEnd);

const mockEl = {
  addEventListener: () => {},
  style: {},
  textContent: '',
  appendChild: () => {},
  classList: { add: () => {}, remove: () => {} }
};

global.window = {
  addEventListener: () => {},
  location: { hash: '' }
};
global.document = {
  getElementById: () => mockEl,
  querySelector: () => mockEl,
  querySelectorAll: () => [],
  addEventListener: () => {}
};

// Expose functions to global
script += '\nglobal.detectParametricFeatures = detectParametricFeatures;\n';
script += 'global.isOptimizedForEdits = isOptimizedForEdits;\n';

eval(script);

console.log('========================================================');
console.log('       PARAMETRIC PROCEDURAL GENERATION AUDIT           ');
console.log('========================================================');

let optimizedCount = 0;
let disabledCount = 0;
let errors = [];

manifest.assets.forEach(a => {
  const isOpt = global.isOptimizedForEdits(a);
  const desc = global.detectParametricFeatures(a);
  if (isOpt) {
    optimizedCount++;
    if (!desc || !desc.optimized) {
      errors.push(a.id + ': Mismatched optimization status');
      return;
    }
    try {
      const svg = desc.generate(desc.params);
      if (!svg || !svg.startsWith('<svg') || !svg.endsWith('</svg>')) {
        errors.push(a.id + ': Invalid SVG output');
      }
    } catch(e) {
      errors.push(a.id + ': ' + e.message);
    }
  } else {
    disabledCount++;
    if (desc && desc.optimized) {
      errors.push(a.id + ': Should not be optimized');
    }
  }
});

console.log(`Total Manifest Assets:             ${manifest.assets.length}`);
console.log(`Optimized (Studio Enabled):        ${optimizedCount} (${((optimizedCount/manifest.assets.length)*100).toFixed(1)}%)`);
console.log(`Unoptimized (Studio Disabled):      ${disabledCount} (${((disabledCount/manifest.assets.length)*100).toFixed(1)}%)`);
console.log(`Live SVG Generation Errors:        ${errors.length}`);
console.log('========================================================');

if (errors.length === 0 && (optimizedCount + disabledCount) === manifest.assets.length) {
  console.log(`>>> VERIFIED: STUDIO IS CLEANLY ENABLED FOR ${optimizedCount} OPTIMIZED ASSETS AND DISABLED FOR ${disabledCount} UNOPTIMIZED ASSETS <<<`);
  process.exit(0);
} else {
  console.error('Audit failed with errors:', errors);
  process.exit(1);
}
