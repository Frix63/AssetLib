import { CENTER, wrapSvg } from '../math';

export function generateRadialHalftone(
  rings: number,
  dotsPerRing: number,
  maxDotR: number,
  invert: boolean = false
): string {
  const rStep = 210 / rings;
  const circles: string[] = [];
  const centerR = invert ? 1.5 : maxDotR;
  circles.push(`  <circle cx="${CENTER}" cy="${CENTER}" r="${centerR.toFixed(2)}" fill="currentColor" />`);

  for (let ring = 1; ring <= rings; ring++) {
    const dist = ring * rStep;
    const t = ring / rings;
    let dotR: number;
    if (invert) {
      dotR = Math.max(1.0, maxDotR * (0.12 + t * 0.88));
    } else {
      dotR = Math.max(1.0, maxDotR * (1.0 - t * 0.82));
      if (dist < centerR + dotR + 2.0) continue;
    }

    // Strict 4-fold symmetry: count is always a multiple of 4
    const rawCount = Math.round((dotsPerRing * t) / 4) * 4;
    const count = Math.max(4, rawCount);

    const angleStep = (2 * Math.PI) / count;
    const offset = (ring % 2) * (angleStep / 2.0);

    for (let d = 0; d < count; d++) {
      const a = d * angleStep + offset;
      const cx = (CENTER + dist * Math.cos(a)).toFixed(2);
      const cy = (CENTER + dist * Math.sin(a)).toFixed(2);
      circles.push(`  <circle cx="${cx}" cy="${cy}" r="${dotR.toFixed(2)}" fill="currentColor" />`);
    }
  }
  return wrapSvg(circles.join('\n'));
}

export function generateMoireRings(rings: number, centerOffset: number): string {
  const paths: string[] = [];
  const maxR = 210;
  const rStep = maxR / rings;
  const sw = 1.8;

  for (let i = 1; i <= rings; i++) {
    const r = i * rStep;
    paths.push(`  <circle cx="${CENTER - centerOffset}" cy="${CENTER}" r="${r.toFixed(1)}" fill="none" stroke="currentColor" stroke-width="${sw}" />`);
    paths.push(`  <circle cx="${CENTER + centerOffset}" cy="${CENTER}" r="${r.toFixed(1)}" fill="none" stroke="currentColor" stroke-width="${sw}" />`);
  }
  return wrapSvg(paths.join('\n'));
}
