import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectParametricFeatures, isOptimizedForEdits } from '../src/core/registry.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));

console.log('========================================================');
console.log('      MIGRATED REACT/TS PROCEDURAL CORE ENGINE AUDIT    ');
console.log('========================================================');

let optimizedCount = 0;
let disabledCount = 0;
const errors: string[] = [];

for (const a of manifest.assets) {
  const isOpt = isOptimizedForEdits(a);
  const desc = detectParametricFeatures(a);

  if (isOpt) {
    optimizedCount++;
    if (!desc || !desc.optimized) {
      errors.push(`${a.id}: Mismatched optimization status`);
      continue;
    }
    try {
      const svg = desc.generate(desc.defaults);
      if (!svg || !svg.startsWith('<svg') || !svg.endsWith('</svg>')) {
        errors.push(`${a.id}: Invalid SVG output`);
      }
    } catch (e: any) {
      errors.push(`${a.id}: ${e.message}`);
    }
  } else {
    disabledCount++;
    if (desc && desc.optimized) {
      errors.push(`${a.id}: Should not be optimized`);
    }
  }
}

console.log(`Total Manifest Assets:             ${manifest.assets.length}`);
console.log(`Optimized (Studio Enabled):        ${optimizedCount} (${((optimizedCount / manifest.assets.length) * 100).toFixed(1)}%)`);
console.log(`Unoptimized (Studio Disabled):      ${disabledCount} (${((disabledCount / manifest.assets.length) * 100).toFixed(1)}%)`);
console.log(`Live SVG Generation Errors:        ${errors.length}`);
console.log('========================================================');

if (errors.length === 0 && (optimizedCount + disabledCount) === manifest.assets.length && optimizedCount === 1175 && disabledCount === 894) {
  console.log(`>>> VERIFIED: MIGRATED CORE ENGINE PASSES 100% (1,175 OPTIMIZED, 894 DISABLED, 0 ERRORS) <<<`);
  process.exit(0);
} else {
  console.error('Audit failed with errors:', errors.slice(0, 10));
  process.exit(1);
}
