import { ParametricDescriptor, ParamControl } from './types';
import {
  generateQuadrantGrid,
  generateBauhausStepped,
  generateBauhausArch,
  generateConcentricSemis,
  generateBauhausPills,
  generateBauhausStripes
} from './generators/bauhaus';
import { generateRadialHalftone, generateMoireRings } from './generators/halftones';
import {
  generatePinchStar,
  generateCutoutStar,
  generatePolygonStar,
  generateCompassStar
} from './generators/stars';
import {
  generateHudCrosshair,
  generateHudViewfinder,
  generateWireframeGlobe,
  generateSwissPlus,
  generateRadarDial
} from './generators/hud';
import {
  generateTwistedPolygon,
  generateWaveDisc,
  generateRhodoneaRose,
  generateHypotrochoid,
  generateLissajous,
  generateFlowerOfLife,
  generateMetatronCube,
  generateHyperspaceVortex
} from './generators/curves';
import {
  generateRetroDaisy,
  generateStarburst,
  generateScallopSeal,
  generatePostageStamp,
  generateRetroRainbow,
  generateIsometricCube,
  generateBrutalistArrow,
  generateCompassNeedle
} from './generators/badges';

export const OPTIMIZED_STUDIO_LABELS = new Set<string>([
  'TWISTED POLY VORTEX',
  'WAVE WARPED DISC',
  'HUD RETICLE / CROSSHAIR',
  'MOIRE INTERFERENCE RINGS',
  'CUTOUT CYBER STAR',
  'Y2K PINCH STAR',
  'RETRO GROOVY DAISY',
  'RETRO STARBURST BADGE',
  'SCALLOPED SEAL',
  'RHODONEA ROSE CURVE',
  'HYPOTROCHOID SPIROGRAPH',
  'WIREFRAME 3D GLOBE',
  'COMPASS NEEDLE',
  'ISOMETRIC 3D CUBE',
  'BRUTALIST ARROW',
  'LISSAJOUS HARMONIC KNOT',
  'RADIAL HALFTONE SCREEN',
  'HUD VIEWFINDER BRACKETS',
  'BAUHAUS STEPPED STRUCTURE',
  'BAUHAUS CATHEDRAL ARCH',
  'SWISS BRUTALIST CROSS',
  'Y2K SHARP STAR',
  'Y2K OUTLINE STAR',
  'Y2K COMPASS STAR',
  'BAUHAUS QUADRANT GRID',
  'BAUHAUS CONCENTRIC SEMICIRCLES',
  'POSTAGE STAMP',
  'RETRO RAINBOW ARCHES',
  'SACRED FLOWER OF LIFE',
  'SACRED METATRON CUBE',
  'HUD RADAR DIAL',
  'BAUHAUS STADIUM PILL',
  'BAUHAUS CIRCULAR STRIPES',
  'BAUHAUS SQUARE STRIPES',
  'HYPERSPACE SPIRAL VORTEX'
]);

export function isOptimizedForEdits(item: any): boolean {
  if (!item) return false;
  const desc = detectParametricFeatures(item);
  return !!(desc && desc.optimized === true);
}

export function detectParametricFeatures(item: any): ParametricDescriptor | null {
  if (!item) return null;
  const name = (item.file || item.primary_file || item.name || item.id || '').toLowerCase();

  // 1. Twisted Poly Vortex
  if (name.includes('twisted_poly')) {
    const m = name.match(/_s(\d+)_l(\d+)_t(\d+)/);
    const p = {
      sides: m ? parseInt(m[1], 10) : 4,
      layers: m ? parseInt(m[2], 10) : 10,
      twist: m ? parseInt(m[3], 10) : 4
    };
    return createDescriptor('TWISTED POLY VORTEX', p, [
      { key: 'sides', label: 'SIDES (S)', type: 'range', min: 3, max: 12, step: 1 },
      { key: 'layers', label: 'LAYERS (L)', type: 'range', min: 3, max: 24, step: 1 },
      { key: 'twist', label: 'TWIST (T)', type: 'range', min: 0, max: 25, step: 1, unit: '°' }
    ], (params) => generateTwistedPolygon(params.sides, params.layers, params.twist));
  }

  // 2. Wave Warped Disc
  if (name.includes('wave_disc')) {
    const m = name.match(/_w(\d+)_a(\d+)_h(\d+)/);
    const p = {
      waves: m ? parseInt(m[1], 10) : 7,
      amp: m ? parseInt(m[2], 10) : 45,
      harm: m ? parseInt(m[3], 10) : 1
    };
    return createDescriptor('WAVE WARPED DISC', p, [
      { key: 'waves', label: 'WAVES (W)', type: 'range', min: 3, max: 16, step: 1 },
      { key: 'amp', label: 'AMPLITUDE (A)', type: 'range', min: 10, max: 80, step: 5, unit: 'px' },
      { key: 'harm', label: 'HARMONICS (H)', type: 'range', min: 1, max: 4, step: 1 }
    ], (params) => generateWaveDisc(params.waves, params.amp, params.harm));
  }

  // 3. HUD Reticle / Crosshair
  if (name.includes('hud_crosshair')) {
    const m = name.match(/_s(\d+)_c(\d+)_g(\d+)/);
    const p = {
      spokes: m ? parseInt(m[1], 10) : 4,
      circles: m ? parseInt(m[2], 10) : 2,
      gap: m ? parseInt(m[3], 10) : 25
    };
    return createDescriptor('HUD RETICLE / CROSSHAIR', p, [
      { key: 'spokes', label: 'SPOKES (S)', type: 'range', min: 2, max: 8, step: 1 },
      { key: 'circles', label: 'CIRCLES (C)', type: 'range', min: 1, max: 5, step: 1 },
      { key: 'gap', label: 'GAP (G)', type: 'range', min: 10, max: 90, step: 5, unit: 'px' }
    ], (params) => generateHudCrosshair(params.spokes, params.circles, params.gap));
  }

  // 4. Moire Interference Rings
  if (name.includes('moire_rings')) {
    const m = name.match(/_r(\d+)_o(\d+)/) || name.match(/_r(\d+)_d(\d+)/);
    const p = {
      rings: m ? parseInt(m[1], 10) : 12,
      offset: m ? parseInt(m[2], 10) : 25
    };
    return createDescriptor('MOIRE INTERFERENCE RINGS', p, [
      { key: 'rings', label: 'RINGS (R)', type: 'range', min: 4, max: 24, step: 1 },
      { key: 'offset', label: 'OFFSET (O)', type: 'range', min: 5, max: 60, step: 5, unit: 'px' }
    ], (params) => generateMoireRings(params.rings, params.offset));
  }

  // 5. Cutout Cyber Star
  if (name.includes('cutout_star')) {
    const m = name.match(/_(\d+)pt_hole(\d+)/);
    const p = {
      points: m ? parseInt(m[1], 10) : 4,
      hole: m ? parseInt(m[2], 10) : 35
    };
    return createDescriptor('CUTOUT CYBER STAR', p, [
      { key: 'points', label: 'POINTS (PT)', type: 'range', min: 3, max: 16, step: 1 },
      { key: 'hole', label: 'HOLE SIZE', type: 'range', min: 20, max: 85, step: 5, unit: 'px' }
    ], (params) => generateCutoutStar(params.points, params.hole));
  }

  // 6. Y2K Pinch Star
  if (name.includes('pinch_star') || name.includes('pinch_astroid')) {
    const m = name.match(/_(\d+)pt_p(\d+)/);
    const m_r = name.match(/_r(\d+)/);
    const p = {
      points: m ? parseInt(m[1], 10) : 8,
      pinch: m ? parseInt(m[2], 10) : 45,
      radius: m_r ? parseInt(m_r[1], 10) : 210
    };
    return createDescriptor('Y2K PINCH STAR', p, [
      { key: 'points', label: 'POINTS (PT)', type: 'range', min: 3, max: 24, step: 1 },
      { key: 'pinch', label: 'PINCH DEPTH', type: 'range', min: 10, max: 95, step: 5, unit: '%' },
      { key: 'radius', label: 'OUTER RADIUS', type: 'range', min: 120, max: 240, step: 10, unit: 'px' }
    ], (params) => generatePinchStar(params.points, params.pinch / 100, params.radius));
  }

  // 7. Retro Groovy Daisy
  if (name.includes('retro_daisy')) {
    const m = name.match(/_(\d+)petals_r\d+_c(\d+)/) || name.match(/_p(\d+)_c(\d+)/);
    const p = {
      petals: m ? parseInt(m[1], 10) : 10,
      center: m ? parseInt(m[2], 10) : 22
    };
    return createDescriptor('RETRO GROOVY DAISY', p, [
      { key: 'petals', label: 'PETALS (P)', type: 'range', min: 5, max: 18, step: 1 },
      { key: 'center', label: 'CENTER SIZE (C)', type: 'range', min: 12, max: 55, step: 2, unit: 'px' }
    ], (params) => generateRetroDaisy(params.petals, params.center));
  }

  // 8. Retro Starburst Badge
  if (name.includes('retro_starburst') || name.includes('starburst_badge')) {
    const m = name.match(/_(\d+)pt_d(\d+)/);
    const p = {
      points: m ? parseInt(m[1], 10) : 16,
      depth: m ? parseInt(m[2], 10) : 82
    };
    return createDescriptor('RETRO STARBURST BADGE', p, [
      { key: 'points', label: 'POINTS (PT)', type: 'range', min: 8, max: 48, step: 2 },
      { key: 'depth', label: 'DEPTH RATIO (D)', type: 'range', min: 50, max: 95, step: 2, unit: '%' }
    ], (params) => generateStarburst(params.points, params.depth));
  }

  // 9. Scalloped Seal
  if (name.includes('seal_scallop') || name.includes('scallop_seal')) {
    const m = name.match(/_(\d+)flute_r\d+_d(\d+)/) || name.match(/_f(\d+)_d(\d+)/);
    const p = {
      flutes: m ? parseInt(m[1], 10) : 16,
      depth: m ? parseInt(m[2], 10) : 12
    };
    return createDescriptor('SCALLOPED SEAL', p, [
      { key: 'flutes', label: 'SCALLOPS (F)', type: 'range', min: 8, max: 48, step: 2 },
      { key: 'depth', label: 'DEPTH (D)', type: 'range', min: 5, max: 30, step: 1, unit: 'px' }
    ], (params) => generateScallopSeal(params.flutes, params.depth));
  }

  // 10. Rhodonea Rose Curve
  if (name.includes('rose_rhodonea') || name.includes('rhodonea_rose')) {
    const m = name.match(/_k(\d+)/);
    const p = { k: m ? parseInt(m[1], 10) : 4 };
    return createDescriptor('RHODONEA ROSE CURVE', p, [
      { key: 'k', label: 'PETAL FREQUENCY (K)', type: 'range', min: 2, max: 12, step: 1 }
    ], (params) => generateRhodoneaRose(params.k));
  }

  // 11. Hypotrochoid Spirograph
  if (name.includes('spiro_hypotrochoid') || name.includes('hypotrochoid')) {
    const m = name.match(/_R(\d+)_r(\d+)_d(\d+)/);
    const p = {
      R: m ? parseInt(m[1], 10) : 150,
      r: m ? parseInt(m[2], 10) : 90,
      d: m ? parseInt(m[3], 10) : 70
    };
    return createDescriptor('HYPOTROCHOID SPIROGRAPH', p, [
      { key: 'R', label: 'OUTER RADIUS (R)', type: 'range', min: 100, max: 200, step: 10, unit: 'px' },
      { key: 'r', label: 'INNER RADIUS (r)', type: 'range', min: 30, max: 120, step: 5 },
      { key: 'd', label: 'PEN DISTANCE (d)', type: 'range', min: 20, max: 100, step: 5 }
    ], (params) => generateHypotrochoid(params.R, params.r, params.d));
  }

  // 12. Wireframe 3D Globe
  if (name.includes('wireframe_globe')) {
    const m = name.match(/_lat(\d+)_lon(\d+)/);
    const p = {
      lat: m ? parseInt(m[1], 10) : 3,
      lon: m ? parseInt(m[2], 10) : 3
    };
    return createDescriptor('WIREFRAME 3D GLOBE', p, [
      { key: 'lat', label: 'LATITUDE LINES', type: 'range', min: 1, max: 8, step: 1 },
      { key: 'lon', label: 'LONGITUDE LINES', type: 'range', min: 1, max: 8, step: 1 }
    ], (params) => generateWireframeGlobe(params.lat, params.lon));
  }

  // 13. Compass Needle
  if (name.includes('compass_needle')) {
    const m = name.match(/_l(\d+)_w(\d+)/);
    const p = {
      length: m ? parseInt(m[1], 10) : 340,
      width: m ? parseInt(m[2], 10) : 60,
      strokeWidth: 4
    };
    return createDescriptor('COMPASS NEEDLE', p, [
      { key: 'length', label: 'LENGTH (L)', type: 'range', min: 180, max: 460, step: 20, unit: 'px' },
      { key: 'width', label: 'WIDTH (W)', type: 'range', min: 30, max: 160, step: 10, unit: 'px' },
      { key: 'strokeWidth', label: 'STROKE WIDTH', type: 'range', min: 2, max: 12, step: 1, unit: 'px' }
    ], (params) => generateCompassNeedle(params.length, params.width, params.strokeWidth));
  }

  // 14. Isometric 3D Cube
  if (name.includes('isometric_cube') || name.includes('isocube') || name.includes('memphis_isometric')) {
    const m = name.match(/_sz(\d+)/) || name.match(/_s(\d+)/);
    const p = {
      size: m ? parseInt(m[1], 10) : 120,
      strokeWidth: 6
    };
    return createDescriptor('ISOMETRIC 3D CUBE', p, [
      { key: 'size', label: 'CUBE SIZE (SZ)', type: 'range', min: 60, max: 180, step: 10, unit: 'px' },
      { key: 'strokeWidth', label: 'STROKE WIDTH', type: 'range', min: 2, max: 14, step: 2, unit: 'px' }
    ], (params) => generateIsometricCube(params.size, params.strokeWidth));
  }

  // 15. Brutalist Arrow
  if (name.includes('arrow_brutalist') || name.includes('brutalist_arrow')) {
    const m = name.match(/_l(\d+)_s(\d+)_h(\d+)/);
    const p = {
      totalL: m ? parseInt(m[1], 10) : 380,
      shaftW: m ? parseInt(m[2], 10) : 60,
      headW: m ? parseInt(m[3], 10) : 180
    };
    return createDescriptor('BRUTALIST ARROW', p, [
      { key: 'totalL', label: 'LENGTH (L)', type: 'range', min: 200, max: 460, step: 20, unit: 'px' },
      { key: 'shaftW', label: 'SHAFT (S)', type: 'range', min: 20, max: 140, step: 10, unit: 'px' },
      { key: 'headW', label: 'HEAD (H)', type: 'range', min: 60, max: 280, step: 20, unit: 'px' }
    ], (params) => generateBrutalistArrow(params.totalL, params.shaftW, params.headW));
  }

  // 16. Lissajous Harmonic Knot
  if (name.includes('lissajous')) {
    const m = name.match(/ratio_(\d+)_(\d+)_p(\d+)/) || name.match(/_x(\d+)_y(\d+)_p(\d+)/);
    const p = {
      freqX: m ? parseInt(m[1], 10) : 1,
      freqY: m ? parseInt(m[2], 10) : 2,
      phase: m ? parseInt(m[3], 10) : 0,
      strokeW: 12
    };
    return createDescriptor('LISSAJOUS HARMONIC KNOT', p, [
      { key: 'freqX', label: 'FREQ X (A)', type: 'range', min: 1, max: 6, step: 1 },
      { key: 'freqY', label: 'FREQ Y (B)', type: 'range', min: 1, max: 6, step: 1 },
      { key: 'phase', label: 'PHASE ANGLE', type: 'range', min: 0, max: 180, step: 15, unit: '°' },
      { key: 'strokeW', label: 'STROKE WIDTH', type: 'range', min: 4, max: 32, step: 2, unit: 'px' }
    ], (params) => generateLissajous(params.freqX, params.freqY, params.phase, params.strokeW));
  }

  // 17. Radial Halftone Screen
  if (name.includes('halftone_radial') || name.includes('radial_halftone')) {
    const m = name.match(/_r(\d+)_d(\d+)_m(\d+)/);
    const p = {
      rings: m ? parseInt(m[1], 10) : 10,
      dots: m ? parseInt(m[2], 10) : 24,
      maxDotR: m ? parseInt(m[3], 10) : 12,
      invert: name.includes('_inv') ? 1 : 0
    };
    return createDescriptor('RADIAL HALFTONE SCREEN', p, [
      { key: 'rings', label: 'CONCENTRIC RINGS', type: 'range', min: 4, max: 20, step: 1 },
      { key: 'dots', label: 'DOT DENSITY', type: 'range', min: 12, max: 48, step: 4 },
      { key: 'maxDotR', label: 'MAX DOT SIZE', type: 'range', min: 4, max: 22, step: 2, unit: 'px' },
      { key: 'invert', label: 'INVERT GRADIENT (0:NORM, 1:INV)', type: 'range', min: 0, max: 1, step: 1 }
    ], (params) => generateRadialHalftone(params.rings, params.dots, params.maxDotR, !!params.invert));
  }

  // 18. HUD Viewfinder Brackets
  if (name.includes('hud_viewfinder')) {
    const m = name.match(/_s(\d+)_a(\d+)_w(\d+)_ch(\d+)/);
    const p = {
      size: m ? parseInt(m[1], 10) : 320,
      armLen: m ? parseInt(m[2], 10) : 140,
      strokeW: m ? parseInt(m[3], 10) : 12,
      chamfer: m ? parseInt(m[4], 10) : 0
    };
    return createDescriptor('HUD VIEWFINDER BRACKETS', p, [
      { key: 'size', label: 'FRAME SIZE (S)', type: 'range', min: 180, max: 440, step: 20, unit: 'px' },
      { key: 'armLen', label: 'ARM LENGTH (A)', type: 'range', min: 40, max: 200, step: 10, unit: 'px' },
      { key: 'chamfer', label: 'CHAMFER (CH)', type: 'range', min: 0, max: 60, step: 10, unit: 'px' },
      { key: 'strokeW', label: 'STROKE WIDTH', type: 'range', min: 4, max: 28, step: 2, unit: 'px' }
    ], (params) => generateHudViewfinder(params.size, params.armLen, params.strokeW, params.chamfer));
  }

  // 19. Bauhaus Stepped Structure
  if (name.includes('bauhaus_stepped')) {
    const m = name.match(/_l(\d+)_w(\d+)_h(\d+)/);
    const p = {
      layers: m ? parseInt(m[1], 10) : 3,
      width: m ? parseInt(m[2], 10) : 320,
      height: m ? parseInt(m[3], 10) : 260
    };
    return createDescriptor('BAUHAUS STEPPED STRUCTURE', p, [
      { key: 'layers', label: 'LAYERS (L)', type: 'range', min: 2, max: 10, step: 1 },
      { key: 'width', label: 'WIDTH (W)', type: 'range', min: 160, max: 440, step: 20, unit: 'px' },
      { key: 'height', label: 'HEIGHT (H)', type: 'range', min: 120, max: 380, step: 20, unit: 'px' }
    ], (params) => generateBauhausStepped(params.layers, params.width, params.height));
  }

  // 20. Bauhaus Cathedral Arch
  if (name.includes('bauhaus_arch')) {
    const m = name.match(/_w(\d+)_h(\d+)_t(\d+)/);
    const p = {
      width: m ? parseInt(m[1], 10) : 240,
      height: m ? parseInt(m[2], 10) : 320,
      thickness: m ? parseInt(m[3], 10) : 0
    };
    return createDescriptor('BAUHAUS CATHEDRAL ARCH', p, [
      { key: 'width', label: 'ARCH WIDTH (W)', type: 'range', min: 120, max: 420, step: 20, unit: 'px' },
      { key: 'height', label: 'TOTAL HEIGHT (H)', type: 'range', min: 160, max: 440, step: 20, unit: 'px' },
      { key: 'thickness', label: 'STROKE THICKNESS', type: 'range', min: 0, max: 60, step: 5, unit: 'px' }
    ], (params) => generateBauhausArch(params.width, params.height, params.thickness));
  }

  // 21. Swiss Brutalist Cross
  if (name.includes('hud_swiss') || name.includes('swiss_plus')) {
    const m = name.match(/_s(\d+)_w(\d+)/);
    const p = {
      size: m ? parseInt(m[1], 10) : 260,
      armThick: m ? parseInt(m[2], 10) : 80
    };
    return createDescriptor('SWISS BRUTALIST CROSS', p, [
      { key: 'size', label: 'CROSS SIZE (S)', type: 'range', min: 140, max: 440, step: 20, unit: 'px' },
      { key: 'armThick', label: 'ARM THICKNESS', type: 'range', min: 30, max: 180, step: 10, unit: 'px' }
    ], (params) => generateSwissPlus(params.size, params.armThick));
  }

  // 22. Y2K Sharp Star & Outline Star
  if (name.includes('y2k_sharp_star') || name.includes('y2k_outline_star')) {
    const m = name.match(/_(\d+)pt_p(\d+)/);
    const sw = name.includes('outline') ? 16 : 0;
    const p = {
      points: m ? parseInt(m[1], 10) : 4,
      rOuter: 220,
      rInner: m ? Math.round(220 * (1.0 - parseInt(m[2], 10) / 100)) : 80,
      strokeW: sw
    };
    const title = sw > 0 ? 'Y2K OUTLINE STAR' : 'Y2K SHARP STAR';
    return createDescriptor(title, p, [
      { key: 'points', label: 'POINTS (PT)', type: 'range', min: 3, max: 24, step: 1 },
      { key: 'rOuter', label: 'OUTER RADIUS', type: 'range', min: 140, max: 240, step: 10, unit: 'px' },
      { key: 'rInner', label: 'INNER RADIUS', type: 'range', min: 20, max: 180, step: 10, unit: 'px' },
      { key: 'strokeW', label: 'STROKE WIDTH', type: 'range', min: 0, max: 32, step: 2, unit: 'px' }
    ], (params) => generatePolygonStar(params.points, params.rOuter, params.rInner, params.strokeW));
  }

  // 23. Y2K Compass Star
  if (name.includes('y2k_compass_star')) {
    const m = name.match(/_m(\d+)_s(\d+)_i(\d+)/);
    const p = {
      rMain: m ? parseInt(m[1], 10) : 220,
      rSub: m ? parseInt(m[2], 10) : 140,
      rInner: m ? parseInt(m[3], 10) : 55
    };
    return createDescriptor('Y2K COMPASS STAR', p, [
      { key: 'rMain', label: 'MAIN ARMS (M)', type: 'range', min: 140, max: 240, step: 10, unit: 'px' },
      { key: 'rSub', label: 'SUB ARMS (S)', type: 'range', min: 80, max: 180, step: 10, unit: 'px' },
      { key: 'rInner', label: 'INNER VALLEYS', type: 'range', min: 20, max: 100, step: 5, unit: 'px' }
    ], (params) => generateCompassStar(params.rMain, params.rSub, params.rInner));
  }

  // 24. Bauhaus Modular Quadrant Grid
  if (name.includes('bauhaus_quadrant')) {
    const m = name.match(/grid_(\d+)x(\d+)_var(\d+)/);
    const p = {
      cells: m ? parseInt(m[1], 10) : 4,
      size: 420,
      seed: m ? parseInt(m[3], 10) : 1
    };
    return createDescriptor('BAUHAUS QUADRANT GRID', p, [
      { key: 'cells', label: 'GRID CELLS', type: 'range', min: 2, max: 8, step: 1 },
      { key: 'size', label: 'FRAME SIZE', type: 'range', min: 240, max: 480, step: 10, unit: 'px' },
      { key: 'seed', label: 'RANDOM SEED', type: 'range', min: 1, max: 100, step: 1 }
    ], (params) => generateQuadrantGrid(params.cells, params.size, params.seed));
  }

  // 25. Bauhaus Concentric Semicircles
  if (name.includes('bauhaus_concentric')) {
    const m = name.match(/_r(\d+)_rad(\d+)/);
    const p = {
      rings: m ? parseInt(m[1], 10) : 3,
      rad: m ? parseInt(m[2], 10) : 180
    };
    return createDescriptor('BAUHAUS CONCENTRIC SEMICIRCLES', p, [
      { key: 'rings', label: 'CONCENTRIC RINGS', type: 'range', min: 2, max: 8, step: 1 },
      { key: 'rad', label: 'OUTER RADIUS', type: 'range', min: 120, max: 240, step: 10, unit: 'px' }
    ], (params) => generateConcentricSemis(params.rings, params.rad));
  }

  // 26. Perforated Postage Stamp
  if (name.includes('postage_stamp')) {
    const m = name.match(/_w(\d+)_h(\d+)_r(\d+)/);
    const p = {
      w: m ? parseInt(m[1], 10) : 340,
      h: m ? parseInt(m[2], 10) : 340,
      r: m ? parseInt(m[3], 10) : 18
    };
    return createDescriptor('POSTAGE STAMP', p, [
      { key: 'w', label: 'STAMP WIDTH', type: 'range', min: 220, max: 460, step: 20, unit: 'px' },
      { key: 'h', label: 'STAMP HEIGHT', type: 'range', min: 220, max: 460, step: 20, unit: 'px' },
      { key: 'r', label: 'PERFORATION RADIUS', type: 'range', min: 8, max: 30, step: 2, unit: 'px' }
    ], (params) => generatePostageStamp(params.w, params.h, params.r));
  }

  // 27. Retro Rainbow Arches
  if (name.includes('retro_rainbow')) {
    const m = name.match(/_a(\d+)_w(\d+)_r(\d+)/);
    const p = {
      arches: m ? parseInt(m[1], 10) : 4,
      width: m ? parseInt(m[2], 10) : 18,
      radius: m ? parseInt(m[3], 10) : 200
    };
    return createDescriptor('RETRO RAINBOW ARCHES', p, [
      { key: 'arches', label: 'ARCH COUNT', type: 'range', min: 2, max: 8, step: 1 },
      { key: 'width', label: 'BAND WIDTH', type: 'range', min: 6, max: 36, step: 2, unit: 'px' },
      { key: 'radius', label: 'OUTER RADIUS', type: 'range', min: 140, max: 240, step: 10, unit: 'px' }
    ], (params) => generateRetroRainbow(params.arches, params.width, params.radius));
  }

  // 28. Sacred Flower of Life
  if (name.includes('sacred_flower')) {
    const m = name.match(/_r(\d+)_l(\d+)/);
    const p = {
      radius: m ? parseInt(m[1], 10) : 200,
      layers: m ? parseInt(m[2], 10) : 2
    };
    return createDescriptor('SACRED FLOWER OF LIFE', p, [
      { key: 'layers', label: 'SACRED LAYERS', type: 'range', min: 1, max: 4, step: 1 },
      { key: 'radius', label: 'OUTER RADIUS', type: 'range', min: 140, max: 240, step: 10, unit: 'px' }
    ], (params) => generateFlowerOfLife(params.radius, params.layers));
  }

  // 29. Sacred Metatron Cube
  if (name.includes('sacred_metatron')) {
    const m = name.match(/_r(\d+)/);
    const p = {
      radius: m ? parseInt(m[1], 10) : 210
    };
    return createDescriptor('SACRED METATRON CUBE', p, [
      { key: 'radius', label: 'OUTER RADIUS', type: 'range', min: 150, max: 240, step: 5, unit: 'px' }
    ], (params) => generateMetatronCube(params.radius));
  }

  // 30. HUD Radar Dial
  if (name.includes('hud_radar')) {
    const m = name.match(/_seg(\d+)_r(\d+)/);
    const p = {
      segments: m ? parseInt(m[1], 10) : 12,
      radius: m ? parseInt(m[2], 10) : 190,
      seed: 42
    };
    return createDescriptor('HUD RADAR DIAL', p, [
      { key: 'segments', label: 'RADIAL SEGMENTS', type: 'range', min: 4, max: 32, step: 2 },
      { key: 'radius', label: 'OUTER RADIUS', type: 'range', min: 120, max: 230, step: 10, unit: 'px' },
      { key: 'seed', label: 'BLIP SEED', type: 'range', min: 1, max: 100, step: 1 }
    ], (params) => generateRadarDial(params.segments, params.radius, params.seed));
  }

  // 31. Bauhaus Stadium Pill
  if (name.includes('bauhaus_pill')) {
    const m = name.match(/_l(\d+)_w(\d+)/);
    const p = {
      length: m ? parseInt(m[1], 10) : 300,
      width: m ? parseInt(m[2], 10) : 160
    };
    return createDescriptor('BAUHAUS STADIUM PILL', p, [
      { key: 'length', label: 'PILL LENGTH', type: 'range', min: 140, max: 440, step: 20, unit: 'px' },
      { key: 'width', label: 'PILL WIDTH', type: 'range', min: 60, max: 280, step: 20, unit: 'px' }
    ], (params) => generateBauhausPills(params.length, params.width));
  }

  // 32. Bauhaus Circular / Square Stripes
  if (name.includes('bauhaus_stripes')) {
    const m = name.match(/_b(\d+)_(circle|square)/);
    const isCircle = m ? m[2] === 'circle' : name.includes('circle');
    const p = {
      bars: m ? parseInt(m[1], 10) : 8,
      isCircle: isCircle ? 1 : 0
    };
    const title = isCircle ? 'BAUHAUS CIRCULAR STRIPES' : 'BAUHAUS SQUARE STRIPES';
    return createDescriptor(title, p, [
      { key: 'bars', label: 'STRIPE COUNT', type: 'range', min: 3, max: 20, step: 1 },
      { key: 'isCircle', label: 'MASK SHAPE (0:SQR, 1:CIRC)', type: 'range', min: 0, max: 1, step: 1 }
    ], (params) => generateBauhausStripes(params.bars, !!params.isCircle));
  }

  // 33. Hyperspace Spiral Vortex
  if (name.includes('acid_vortex') || name.includes('spiral_vortex') || name.includes('hyperspace_vortex')) {
    const m = name.match(/_arm(\d+)_t(\d+)_w(\d+)/);
    const p = {
      arms: m ? parseInt(m[1], 10) : 8,
      turns: m ? parseInt(m[2], 10) / 10 : 0.8,
      strokeW: m ? parseInt(m[3], 10) : 8
    };
    return createDescriptor('HYPERSPACE SPIRAL VORTEX', p, [
      { key: 'arms', label: 'SPIRAL ARMS', type: 'range', min: 3, max: 32, step: 1 },
      { key: 'turns', label: 'TIGHTNESS / TURNS', type: 'range', min: 0.3, max: 2.5, step: 0.1 },
      { key: 'strokeW', label: 'STROKE WEIGHT', type: 'range', min: 2, max: 20, step: 1, unit: 'px' }
    ], (params) => generateHyperspaceVortex(params.arms, params.turns, params.strokeW));
  }

  return null;
}

function createDescriptor(
  label: string,
  defaults: Record<string, any>,
  controls: ParamControl[],
  generatorFn: (params: Record<string, any>) => string
): ParametricDescriptor {
  const isOpt = OPTIMIZED_STUDIO_LABELS.has(label);
  return {
    optimized: isOpt,
    type: label.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    label,
    controls,
    defaults: { ...defaults },
    randomize: () => {
      const next: Record<string, any> = {};
      controls.forEach(ctrl => {
        if (ctrl.min !== undefined && ctrl.max !== undefined) {
          const step = ctrl.step || 1;
          const steps = Math.floor((ctrl.max - ctrl.min) / step);
          const randStep = Math.floor(Math.random() * (steps + 1));
          next[ctrl.key] = ctrl.min + randStep * step;
        } else {
          next[ctrl.key] = defaults[ctrl.key];
        }
      });
      return next;
    },
    generate: generatorFn
  };
}
