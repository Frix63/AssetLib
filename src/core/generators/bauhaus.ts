import { CENTER, wrapSvg, splitmix32 } from '../math';

export function generateQuadrantGrid(cells: number, size: number, seed: number): string {
  const rng = splitmix32(seed);
  const cw = size / cells;
  const ox = (512 - size) / 2;
  const oy = (512 - size) / 2;
  const paths: string[] = [];

  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const x = ox + c * cw;
      const y = oy + r * cw;
      const x0 = x.toFixed(1);
      const x1 = (x + cw).toFixed(1);
      const y0 = y.toFixed(1);
      const y1 = (y + cw).toFixed(1);
      const cx = (x + cw / 2).toFixed(1);
      const cy = (y + cw / 2).toFixed(1);
      const rArc = cw.toFixed(1);
      const rCirc = (cw * 0.48).toFixed(1);

      const tile = Math.floor(rng() * 8);
      switch (tile) {
        case 0:
          paths.push(`<path d="M ${x0} ${y0} L ${x1} ${y0} A ${rArc} ${rArc} 0 0 1 ${x0} ${y1} Z" fill="currentColor" />`);
          break;
        case 1:
          paths.push(`<path d="M ${x1} ${y0} L ${x1} ${y1} A ${rArc} ${rArc} 0 0 1 ${x0} ${y0} Z" fill="currentColor" />`);
          break;
        case 2:
          paths.push(`<path d="M ${x1} ${y1} L ${x0} ${y1} A ${rArc} ${rArc} 0 0 1 ${x1} ${y0} Z" fill="currentColor" />`);
          break;
        case 3:
          paths.push(`<path d="M ${x0} ${y1} L ${x0} ${y0} A ${rArc} ${rArc} 0 0 1 ${x1} ${y1} Z" fill="currentColor" />`);
          break;
        case 4:
          paths.push(`<path d="M ${x0} ${y0} L ${x1} ${y0} L ${x0} ${y1} Z" fill="currentColor" />`);
          break;
        case 5:
          paths.push(`<path d="M ${x1} ${y1} L ${x0} ${y1} L ${x1} ${y0} Z" fill="currentColor" />`);
          break;
        case 6:
          paths.push(`<circle cx="${cx}" cy="${cy}" r="${rCirc}" fill="currentColor" />`);
          break;
        case 7:
          paths.push(`<rect x="${x0}" y="${y0}" width="${cw.toFixed(1)}" height="${cw.toFixed(1)}" fill="currentColor" />`);
          break;
      }
    }
  }
  return wrapSvg(`  ${paths.join('\n  ')}`);
}

export function generateBauhausStepped(layers: number, width: number, height: number): string {
  const stepH = height / layers;
  const d: string[] = [];
  const topY = CENTER - height / 2;
  const botY = CENTER + height / 2;
  const lX: [number, number][] = [];
  const rX: [number, number][] = [];

  for (let i = 0; i < layers; i++) {
    const w = width * (1.0 - (i / layers) * 0.7);
    const yTop = topY + (layers - 1 - i) * stepH;
    const yBot = yTop + stepH;
    lX.push([CENTER - w / 2, yBot], [CENTER - w / 2, yTop]);
    rX.push([CENTER + w / 2, yBot], [CENTER + w / 2, yTop]);
  }

  d.push(`M ${CENTER} ${botY}`);
  lX.forEach(pt => d.push(`L ${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`));
  rX.reverse().forEach(pt => d.push(`L ${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`));
  d.push('Z');
  return wrapSvg(`  <path d="${d.join(' ')}" fill="currentColor" />`);
}

export function generateBauhausArch(width: number, height: number, thickness: number = 0): string {
  const r = width / 2;
  const topY = CENTER - height / 2 + r;
  const botY = CENTER + height / 2;
  const leftX = CENTER - r;
  const rightX = CENTER + r;

  let d = `M ${leftX} ${botY} L ${leftX} ${topY} A ${r} ${r} 0 0 1 ${rightX} ${topY} L ${rightX} ${botY} Z`;
  if (thickness > 0 && thickness < width / 2) {
    const inR = r - thickness;
    const inLeft = CENTER - inR;
    const inRight = CENTER + inR;
    const inTop = topY;
    d += ` M ${inLeft} ${botY} L ${inLeft} ${inTop} A ${inR} ${inR} 0 0 1 ${inRight} ${inTop} L ${inRight} ${botY} Z`;
    return wrapSvg(`  <path d="${d}" fill="currentColor" fill-rule="evenodd" />`);
  }
  return wrapSvg(`  <path d="${d}" fill="currentColor" />`);
}

export function generateConcentricSemis(rings: number, rad: number): string {
  const paths: string[] = [];
  const sw = rad / (rings * 2.2);
  for (let i = 0; i < rings; i++) {
    const r = rad - i * (rad / rings);
    paths.push(`<path d="M ${CENTER - r} ${CENTER} A ${r} ${r} 0 0 1 ${CENTER + r} ${CENTER}" fill="none" stroke="currentColor" stroke-width="${sw.toFixed(1)}" stroke-linecap="round" />`);
  }
  return wrapSvg(`  ${paths.join('\n  ')}`);
}

export function generateBauhausPills(length: number, width: number): string {
  const r = width / 2;
  const halfL = length / 2;
  const d = `M ${CENTER - halfL + r} ${CENTER - r} L ${CENTER + halfL - r} ${CENTER - r} A ${r} ${r} 0 0 1 ${CENTER + halfL - r} ${CENTER + r} L ${CENTER - halfL + r} ${CENTER + r} A ${r} ${r} 0 0 1 ${CENTER - halfL + r} ${CENTER - r} Z`;
  return wrapSvg(`  <path d="${d}" fill="currentColor" />`);
}

export function generateBauhausStripes(bars: number, isCircle: boolean): string {
  const size = 380;
  const barH = size / (bars * 2 - 1);
  const startY = CENTER - size / 2;
  const startX = CENTER - size / 2;
  const rects: string[] = [];

  for (let i = 0; i < bars; i++) {
    const y = startY + i * barH * 2;
    rects.push(`<rect x="${startX}" y="${y.toFixed(1)}" width="${size}" height="${barH.toFixed(1)}" fill="currentColor" />`);
  }

  if (isCircle) {
    const r = size / 2;
    return wrapSvg(`  <defs>\n    <clipPath id="circleClip">\n      <circle cx="${CENTER}" cy="${CENTER}" r="${r}" />\n    </clipPath>\n  </defs>\n  <g clip-path="url(#circleClip)">\n    ${rects.join('\n    ')}\n  </g>`);
  }
  return wrapSvg(`  ${rects.join('\n  ')}`);
}
