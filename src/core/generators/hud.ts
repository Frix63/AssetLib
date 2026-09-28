import { CENTER, wrapSvg, splitmix32 } from '../math';

export function generateHudCrosshair(spokes: number, circles: number, gap: number, radius: number = 200): string {
  const elements: string[] = [];
  const stepC = (radius - gap) / (circles + 1);
  for (let c = 1; c <= circles; c++) {
    const r = (gap + c * stepC).toFixed(2);
    elements.push(`  <circle cx="${CENTER}" cy="${CENTER}" r="${r}" fill="none" stroke="currentColor" stroke-width="4" />`);
  }
  const angleStep = (2 * Math.PI) / spokes;
  for (let s = 0; s < spokes; s++) {
    const a = s * angleStep;
    const x1 = (CENTER + gap * Math.cos(a)).toFixed(2);
    const y1 = (CENTER + gap * Math.sin(a)).toFixed(2);
    const x2 = (CENTER + (radius + 20) * Math.cos(a)).toFixed(2);
    const y2 = (CENTER + (radius + 20) * Math.sin(a)).toFixed(2);
    elements.push(`  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-width="5" stroke-linecap="square" />`);
  }
  elements.push(`  <circle cx="${CENTER}" cy="${CENTER}" r="6" fill="currentColor" />`);
  return wrapSvg(elements.join('\n'));
}

export function generateHudViewfinder(size: number, armLen: number, strokeW: number = 12, chamfer: number = 0): string {
  const half = size / 2;
  const x0 = CENTER - half, y0 = CENTER - half;
  const x1 = CENTER + half, y1 = CENTER + half;
  const paths: string[] = [];
  if (chamfer === 0) {
    paths.push(`  <path d="M ${x0} ${y0 + armLen} L ${x0} ${y0} L ${x0 + armLen} ${y0}" stroke="currentColor" stroke-width="${strokeW}" stroke-linecap="square" fill="none" />`);
    paths.push(`  <path d="M ${x1 - armLen} ${y0} L ${x1} ${y0} L ${x1} ${y0 + armLen}" stroke="currentColor" stroke-width="${strokeW}" stroke-linecap="square" fill="none" />`);
    paths.push(`  <path d="M ${x1} ${y1 - armLen} L ${x1} ${y1} L ${x1 - armLen} ${y1}" stroke="currentColor" stroke-width="${strokeW}" stroke-linecap="square" fill="none" />`);
    paths.push(`  <path d="M ${x0 + armLen} ${y1} L ${x0} ${y1} L ${x0} ${y1 - armLen}" stroke="currentColor" stroke-width="${strokeW}" stroke-linecap="square" fill="none" />`);
  } else {
    const c = chamfer;
    paths.push(`  <path d="M ${x0} ${y0 + armLen} L ${x0} ${y0 + c} L ${x0 + c} ${y0} L ${x0 + armLen} ${y0}" stroke="currentColor" stroke-width="${strokeW}" stroke-linecap="square" fill="none" />`);
    paths.push(`  <path d="M ${x1 - armLen} ${y0} L ${x1 - c} ${y0} L ${x1} ${y0 + c} L ${x1} ${y0 + armLen}" stroke="currentColor" stroke-width="${strokeW}" stroke-linecap="square" fill="none" />`);
    paths.push(`  <path d="M ${x1} ${y1 - armLen} L ${x1} ${y1 - c} L ${x1 - c} ${y1} L ${x1 - armLen} ${y1}" stroke="currentColor" stroke-width="${strokeW}" stroke-linecap="square" fill="none" />`);
    paths.push(`  <path d="M ${x0 + armLen} ${y1} L ${x0 + c} ${y1} L ${x0} ${y1 - c} L ${x0} ${y1 - armLen}" stroke="currentColor" stroke-width="${strokeW}" stroke-linecap="square" fill="none" />`);
  }
  const cLen = 24;
  paths.push(`  <path d="M ${CENTER - cLen} ${CENTER} L ${CENTER + cLen} ${CENTER} M ${CENTER} ${CENTER - cLen} L ${CENTER} ${CENTER + cLen}" stroke="currentColor" stroke-width="${strokeW * 0.75}" stroke-linecap="square" fill="none" />`);
  return wrapSvg(paths.join('\n'));
}

export function generateWireframeGlobe(latLines: number, lonLines: number, radius: number = 180): string {
  const elements: string[] = [];
  elements.push(`  <circle cx="${CENTER}" cy="${CENTER}" r="${radius}" fill="none" stroke="currentColor" stroke-width="5" />`);
  elements.push(`  <line x1="${CENTER - radius}" y1="${CENTER}" x2="${CENTER + radius}" y2="${CENTER}" stroke="currentColor" stroke-width="4" />`);
  elements.push(`  <line x1="${CENTER}" y1="${CENTER - radius}" x2="${CENTER}" y2="${CENTER + radius}" stroke="currentColor" stroke-width="4" />`);
  for (let i = 1; i <= latLines; i++) {
    const frac = i / (latLines + 1);
    const yOffset = radius * frac;
    const w = Math.sqrt(radius * radius - yOffset * yOffset);
    elements.push(`  <ellipse cx="${CENTER}" cy="${(CENTER - yOffset).toFixed(2)}" rx="${w.toFixed(2)}" ry="${(w * 0.35).toFixed(2)}" fill="none" stroke="currentColor" stroke-width="3" />`);
    elements.push(`  <ellipse cx="${CENTER}" cy="${(CENTER + yOffset).toFixed(2)}" rx="${w.toFixed(2)}" ry="${(w * 0.35).toFixed(2)}" fill="none" stroke="currentColor" stroke-width="3" />`);
  }
  for (let i = 1; i <= lonLines; i++) {
    const rx = radius * (i / (lonLines + 1));
    elements.push(`  <ellipse cx="${CENTER}" cy="${CENTER}" rx="${rx.toFixed(2)}" ry="${radius}" fill="none" stroke="currentColor" stroke-width="3" />`);
  }
  return wrapSvg(elements.join('\n'));
}

export function generateSwissPlus(size: number, armThick: number): string {
  const halfS = size / 2;
  const halfT = armThick / 2;
  const d = `M ${CENTER - halfT} ${CENTER - halfS} ` +
            `L ${CENTER + halfT} ${CENTER - halfS} ` +
            `L ${CENTER + halfT} ${CENTER - halfT} ` +
            `L ${CENTER + halfS} ${CENTER - halfT} ` +
            `L ${CENTER + halfS} ${CENTER + halfT} ` +
            `L ${CENTER + halfT} ${CENTER + halfT} ` +
            `L ${CENTER + halfT} ${CENTER + halfS} ` +
            `L ${CENTER - halfT} ${CENTER + halfS} ` +
            `L ${CENTER - halfT} ${CENTER + halfT} ` +
            `L ${CENTER - halfS} ${CENTER + halfT} ` +
            `L ${CENTER - halfS} ${CENTER - halfT} ` +
            `L ${CENTER - halfT} ${CENTER - halfT} Z`;
  return wrapSvg(`  <path d="${d}" fill="currentColor" />`);
}

export function generateRadarDial(segments: number, radius: number, seed: number): string {
  const rng = splitmix32(seed);
  const els: string[] = [];
  for (let r = radius; r >= 40; r -= radius / 4) {
    els.push(`<circle cx="${CENTER}" cy="${CENTER}" r="${r.toFixed(1)}" fill="none" stroke="currentColor" stroke-width="2" />`);
  }
  els.push(`<line x1="${CENTER - radius - 15}" y1="${CENTER}" x2="${CENTER + radius + 15}" y2="${CENTER}" stroke="currentColor" stroke-width="2" />`);
  els.push(`<line x1="${CENTER}" y1="${CENTER - radius - 15}" x2="${CENTER}" y2="${CENTER + radius + 15}" stroke="currentColor" stroke-width="2" />`);
  const step = (2 * Math.PI) / segments;
  for (let i = 0; i < segments; i++) {
    const a = i * step;
    const x1 = CENTER + (radius - 12) * Math.cos(a);
    const y1 = CENTER + (radius - 12) * Math.sin(a);
    const x2 = CENTER + radius * Math.cos(a);
    const y2 = CENTER + radius * Math.sin(a);
    els.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="currentColor" stroke-width="3" />`);
  }
  const blipCount = 3 + Math.floor(rng() * 5);
  for (let b = 0; b < blipCount; b++) {
    const ba = rng() * Math.PI * 2;
    const br = 40 + rng() * (radius - 50);
    const bx = CENTER + br * Math.cos(ba);
    const by = CENTER + br * Math.sin(ba);
    els.push(`<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="5" fill="currentColor" />`);
    els.push(`<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="10" fill="none" stroke="currentColor" stroke-width="1.5" />`);
  }
  return wrapSvg(`  ${els.join('\n  ')}`);
}
