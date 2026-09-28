import assert from 'node:assert';
import { useAppStore } from '../src/store/useAppStore';
import { AssetItem } from '../src/core/types';

console.log('--- Testing Modal Selection and SVG Preservation ---');

// 1. Mock assets list simulating archetypes / deduplicated items
const mockItems: AssetItem[] = [
  {
    id: '01_y_0010',
    name: 'y2k_cutout_star_4pt_hole35',
    title: 'Cutout 4-Point Star',
    category: '01_y2k_cyber_stars',
    file: 'assets/svg/01_y2k_cyber_stars/y2k_cutout_star_4pt_hole35.svg',
    svg: '<svg id="cutout-4pt"><path d="M 476 256"/></svg>'
  },
  {
    // Deliberately no id property to test fallback matching and avoid undefined === undefined false match
    name: 'y2k_pinch_star_12pt_p45_r210',
    title: '12-Point Y2K Cyber Star',
    category: '01_y2k_cyber_stars',
    file: 'assets/svg/01_y2k_cyber_stars/y2k_pinch_star_12pt_p45_r210.svg',
    svg: '<svg id="pinch-12pt"><path d="M 466 256"/></svg>'
  },
  {
    id: '01_y_0083',
    name: 'y2k_pinch_star_16pt_p45_r210',
    title: '16-Point Y2K Cyber Star',
    category: '01_y2k_cyber_stars',
    file: 'assets/svg/01_y2k_cyber_stars/y2k_pinch_star_16pt_p45_r210.svg',
    svg: '<svg id="pinch-16pt"><path d="M 466 256"/></svg>'
  },
  {
    // Item without id and with primary_file instead of file
    primary_file: 'assets/svg/04_bauhaus_swiss/bauhaus_arch_w240_h380.svg',
    file: 'assets/svg/04_bauhaus_swiss/bauhaus_arch_w240_h380.svg',
    title: 'Bauhaus Cathedral Arch',
    category: '04_bauhaus_swiss',
    svg: '<svg id="bauhaus-arch"><path d="M 100 200"/></svg>'
  }
];

// Test 1: Clicking second item (12-point star)
const store = useAppStore.getState();
store.openModal(mockItems[1], false, mockItems);

let state = useAppStore.getState();
assert.strictEqual(state.isModalOpen, true, 'Modal should be open');
assert.strictEqual(state.currentModalIndex, 1, 'Current modal index must be 1 (clicked item)');
assert.strictEqual(state.modalItems[state.currentModalIndex].name, 'y2k_pinch_star_12pt_p45_r210', 'Active item must match clicked item');
assert.strictEqual(state.currentOriginalSvg, mockItems[1].svg, 'Original SVG must be preserved, not overwritten by procedural defaults');
console.log('✓ Test 1 Passed: Exact clicked asset opened with authentic SVG preserved (index 1)');

// Test 2: Clicking fourth item (Bauhaus Cathedral Arch)
store.openModal(mockItems[3], false, mockItems);
state = useAppStore.getState();
assert.strictEqual(state.currentModalIndex, 3, 'Current modal index must be 3');
assert.strictEqual(state.currentOriginalSvg, mockItems[3].svg, 'Bauhaus arch authentic SVG must be preserved');
console.log('✓ Test 2 Passed: Asset with primary_file opened at index 3');

// Test 3: Navigation next and prev
store.prevModal();
state = useAppStore.getState();
assert.strictEqual(state.currentModalIndex, 2, 'prevModal should move to index 2');
assert.strictEqual(state.currentOriginalSvg, mockItems[2].svg, '16-point star authentic SVG preserved on prev');

store.nextModal();
state = useAppStore.getState();
assert.strictEqual(state.currentModalIndex, 3, 'nextModal should move back to index 3');
assert.strictEqual(state.currentOriginalSvg, mockItems[3].svg, 'Bauhaus arch authentic SVG preserved on next');
console.log('✓ Test 3 Passed: Modal prev/next navigation preserves authentic SVGs');

console.log('--- ALL MODAL SELECTION TESTS PASSED ---');
