import assert from 'node:assert';
import { parseRoute } from '../src/core/router';
import { useAppStore } from '../src/store/useAppStore';

console.log('--- Testing URL Router & Group Page Resolution ---');

// 1. Pathname parsing
assert.deepStrictEqual(
  parseRoute('/group/spiral_vortexes', '', ''),
  { type: 'group', groupId: 'spiral_vortexes' },
  'Should parse /group/:id'
);

assert.deepStrictEqual(
  parseRoute('/groups/cutout_stars/', '', ''),
  { type: 'group', groupId: 'cutout_stars' },
  'Should parse /groups/:id with trailing slash'
);

assert.deepStrictEqual(
  parseRoute('/category/03_acid_cyber_sigils', '', ''),
  { type: 'category', categoryId: '03_acid_cyber_sigils' },
  'Should parse /category/:id'
);

assert.deepStrictEqual(
  parseRoute('/all', '', ''),
  { type: 'all' },
  'Should parse /all'
);

assert.deepStrictEqual(
  parseRoute('/', '', ''),
  { type: 'home' },
  'Should parse root / as home'
);

// 1b. Subfolder prefix tests (/assetlib/...)
assert.deepStrictEqual(
  parseRoute('/assetlib', '', ''),
  { type: 'home' },
  'Should parse /assetlib as home'
);

assert.deepStrictEqual(
  parseRoute('/assetlib/', '', ''),
  { type: 'home' },
  'Should parse /assetlib/ as home'
);

assert.deepStrictEqual(
  parseRoute('/assetlib/group/spiral_vortexes', '', ''),
  { type: 'group', groupId: 'spiral_vortexes' },
  'Should parse /assetlib/group/:id'
);

assert.deepStrictEqual(
  parseRoute('/assetlib/all', '', ''),
  { type: 'all' },
  'Should parse /assetlib/all'
);

// 1c. License & FAQ subpage tests
assert.deepStrictEqual(
  parseRoute('/license', '', ''),
  { type: 'license' },
  'Should parse /license'
);

assert.deepStrictEqual(
  parseRoute('/faq', '', ''),
  { type: 'faq' },
  'Should parse /faq'
);

assert.deepStrictEqual(
  parseRoute('/assetlib/license', '', ''),
  { type: 'license' },
  'Should parse /assetlib/license'
);

assert.deepStrictEqual(
  parseRoute('/assetlib/faq', '', ''),
  { type: 'faq' },
  'Should parse /assetlib/faq'
);

// 2. Hash & Search Fallback Parsing
assert.deepStrictEqual(
  parseRoute('/', '#/group/spiral_vortexes', ''),
  { type: 'group', groupId: 'spiral_vortexes' },
  'Should parse hash fallback #/group/:id'
);

assert.deepStrictEqual(
  parseRoute('/', '', '?group=spiral_vortexes'),
  { type: 'group', groupId: 'spiral_vortexes' },
  'Should parse search query ?group=:id'
);

console.log('✓ All Route Parser Tests Passed');

// 3. Store integration
const store = useAppStore.getState();
const mockCol = {
  id: 'spiral_vortexes',
  title: 'Hyperspace Spiral Vortexes',
  category: '03_acid_cyber_sigils',
  category_label: 'Acid & Cyber Sigils',
  description: 'Test vortexes',
  tags: ['vortex'],
  primary_file: 'assets/svg/03_acid_cyber_sigils/acid_vortex_arm12_t12_w8.svg',
  primary_svg: '<svg></svg>',
  count: 40
};

store.setActiveCollection(mockCol, false);
const stateWithCol = useAppStore.getState();
assert.strictEqual(stateWithCol.viewMode, 'group_detail', 'viewMode must be group_detail');
assert.strictEqual(stateWithCol.activeCollection?.id, 'spiral_vortexes', 'activeCollection must be set');
assert.strictEqual(stateWithCol.activeCategory, '03_acid_cyber_sigils', 'activeCategory must match collection category');

store.setActiveCollection(null, false);
const stateHome = useAppStore.getState();
assert.strictEqual(stateHome.viewMode, 'groups', 'viewMode must return to groups');
assert.strictEqual(stateHome.activeCollection, null, 'activeCollection must be null');

console.log('✓ Store Group Navigation State Passed');
console.log('--- ALL ROUTER TESTS PASSED ---');
