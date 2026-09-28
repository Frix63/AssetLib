import { CENTER, wrapSvg } from '../math';
import { smoothCardinalSpline } from './curves';

export function generateRetroDaisy(petals: number, centerSize: number, roundness: number = 0.45, rOuter: number = 210): string {
  const angleStep = (2 * Math.PI) / petals;
  const pts: [number, number][] = [];
  for (let i = 0; i < petals; i++) {
    const aMid = i * angleStep;
    const aLeft = aMid - angleStep * 0.4;
    const pBase: [number, number] = [CENTER + centerSize * 1.05 * Math.cos(aLeft), CENTER + centerSize * 1.05 * Math.sin(aLeft)];
    const pTip: [number, number] = [CENTER + rOuter * Math.cos(aMid), CENTER + rOuter * Math.sin(aMid)];
    pts.push(pBase, pTip);
  }
  const dPetals = smoothCardinalSpline(pts, roundness, true);
  const dHole = `M ${CENTER - centerSize} ${CENTER} A ${centerSize} ${centerSize} 0 1 0 ${CENTER + centerSize} ${CENTER} A ${centerSize} ${centerSize} 0 1 0 ${CENTER - centerSize} ${CENTER} Z`;
  const innerDiscR = (centerSize * 0.6).toFixed(2);
  return wrapSvg(`  <path d="${dPetals} ${dHole}" fill="currentColor" fill-rule="evenodd" />\n  <circle cx="${CENTER}" cy="${CENTER}" r="${innerDiscR}" fill="currentColor" />`);
}

export function generateStarburst(points: number, depthRatio: number, rOuter: number = 210): string {
  const total = points * 2;
  const step = (2 * Math.PI) / total;
  const rInner = rOuter * (depthRatio / 100);
  const pts: [number, number][] = [];
  for (let i = 0; i < total; i++) {
    const rad = i % 2 === 0 ? rOuter : rInner;
    const a = i * step;
    pts.push([CENTER + rad * Math.cos(a), CENTER + rad * Math.sin(a)]);
  }
  const d = smoothCardinalSpline(pts, 0.4, true);
  return wrapSvg(`  <path d="${d}" fill="currentColor" />`);
}

export function generateScallopSeal(flutes: number, depth: number, rOuter: number = 210): string {
  const total = flutes * 2;
  const step = (2 * Math.PI) / total;
  const rInner = rOuter - depth;
  const pts: [number, number][] = [];
  for (let i = 0; i < total; i++) {
    const rad = i % 2 === 0 ? rOuter : rInner;
    const a = i * step;
    pts.push([CENTER + rad * Math.cos(a), CENTER + rad * Math.sin(a)]);
  }
  const d = smoothCardinalSpline(pts, 0.5, true);
  return wrapSvg(`  <path d="${d}" fill="currentColor" />`);
}

export function generatePostageStamp(w: number, h: number, r: number): string {
  const x1 = (512 - w) / 2;
  const x2 = x1 + w;
  const y1 = (512 - h) / 2;
  const y2 = y1 + h;
  const pitch = r * 2.2;
  const nx = Math.max(3, Math.floor((w - 2 * r) / pitch));
  const ny = Math.max(3, Math.floor((h - 2 * r) / pitch));
  const stepX = (w - 2 * r) / nx;
  const stepY = (h - 2 * r) / ny;

  let d = `M ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  for (let i = 0; i < nx; i++) {
    const segStart = x1 + r + i * stepX;
    d += ` L ${segStart.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 0 0 ${(segStart + r).toFixed(1)} ${y1.toFixed(1)}`;
  }
  d += ` L ${x2.toFixed(1)} ${y1.toFixed(1)}`;
  for (let i = 0; i < ny; i++) {
    const segStart = y1 + r + i * stepY;
    d += ` L ${x2.toFixed(1)} ${segStart.toFixed(1)} A ${r} ${r} 0 0 0 ${x2.toFixed(1)} ${(segStart + r).toFixed(1)}`;
  }
  d += ` L ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  for (let i = nx - 1; i >= 0; i--) {
    const segEnd = x1 + r + i * stepX + r;
    const segStart = x1 + r + i * stepX;
    d += ` L ${segEnd.toFixed(1)} ${y2.toFixed(1)} A ${r} ${r} 0 0 0 ${segStart.toFixed(1)} ${y2.toFixed(1)}`;
  }
  d += ` L ${x1.toFixed(1)} ${y2.toFixed(1)}`;
  for (let i = ny - 1; i >= 0; i--) {
    const segEnd = y1 + r + i * stepY + r;
    const segStart = y1 + r + i * stepY;
    d += ` L ${x1.toFixed(1)} ${segEnd.toFixed(1)} A ${r} ${r} 0 0 0 ${x1.toFixed(1)} ${segStart.toFixed(1)}`;
  }
  d += ' Z';

  const inW = Math.max(20, w - 48);
  const inH = Math.max(20, h - 48);
  const inX = (512 - inW) / 2;
  const inY = (512 - inH) / 2;

  return wrapSvg(`  <path d="${d}" fill="currentColor" fill-rule="evenodd" />\n  <rect x="${inX.toFixed(1)}" y="${inY.toFixed(1)}" width="${inW.toFixed(1)}" height="${inH.toFixed(1)}" fill="none" stroke="white" stroke-width="6" />`);
}

export function generateRetroRainbow(arches: number, width: number, radius: number): string {
  const paths: string[] = [];
  const step = (radius - 20) / arches;
  for (let i = 0; i < arches; i++) {
    const curR = radius - i * step;
    const x1 = CENTER - curR;
    const x2 = CENTER + curR;
    paths.push(`<path d="M ${x1.toFixed(1)} 320 A ${curR.toFixed(1)} ${curR.toFixed(1)} 0 0 1 ${x2.toFixed(1)} 320" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" />`);
  }
  return wrapSvg(`  ${paths.join('\n  ')}`);
}

export function generateIsometricCube(size: number, strokeWidth: number = 6): string {
  const dx = size * Math.cos(Math.PI / 6);
  const dy = size * Math.sin(Math.PI / 6);
  const pTop = [CENTER, CENTER - size];
  const pTopRight = [CENTER + dx, CENTER - dy];
  const pBotRight = [CENTER + dx, CENTER + size - dy];
  const pBot = [CENTER, CENTER + size];
  const pBotLeft = [CENTER - dx, CENTER + size - dy];
  const pTopLeft = [CENTER - dx, CENTER - dy];
  const dTop = `M ${CENTER} ${CENTER} L ${pTopRight[0].toFixed(2)} ${pTopRight[1].toFixed(2)} L ${pTop[0].toFixed(2)} ${pTop[1].toFixed(2)} L ${pTopLeft[0].toFixed(2)} ${pTopLeft[1].toFixed(2)} Z`;
  const dHex = `M ${pTop[0].toFixed(2)} ${pTop[1].toFixed(2)} L ${pTopRight[0].toFixed(2)} ${pTopRight[1].toFixed(2)} L ${pBotRight[0].toFixed(2)} ${pBotRight[1].toFixed(2)} L ${pBot[0].toFixed(2)} ${pBot[1].toFixed(2)} L ${pBotLeft[0].toFixed(2)} ${pBotLeft[0].toFixed(2)} L ${pTopLeft[0].toFixed(2)} ${pTopLeft[1].toFixed(2)} Z`;
  return wrapSvg(`  <path d="${dTop}" fill="currentColor" stroke="none" />\n  <path d="${dHex}" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linejoin="miter" stroke-miterlimit="10" />\n  <path d="M ${CENTER} ${CENTER} L ${pTop[0].toFixed(2)} ${pTop[1].toFixed(2)}" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="butt" />\n  <path d="M ${CENTER} ${CENTER} L ${pBotLeft[0].toFixed(2)} ${pBotLeft[1].toFixed(2)}" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="butt" />\n  <path d="M ${CENTER} ${CENTER} L ${pBotRight[0].toFixed(2)} ${pBotRight[1].toFixed(2)}" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="butt" />`);
}

export function generateBrutalistArrow(totalL: number, shaftW: number, headW: number): string {
  const halfShaft = shaftW / 2;
  const halfHead = headW / 2;
  const headL = headW * 0.8;
  const shaftL = totalL - headL;
  const xTail = CENTER - totalL / 2;
  const xSplit = xTail + shaftL;
  const xTip = CENTER + totalL / 2;
  const d = `M ${xTail.toFixed(2)} ${(CENTER - halfShaft).toFixed(2)} ` +
            `L ${xSplit.toFixed(2)} ${(CENTER - halfShaft).toFixed(2)} ` +
            `L ${xSplit.toFixed(2)} ${(CENTER - halfHead).toFixed(2)} ` +
            `L ${xTip.toFixed(2)} ${CENTER} ` +
            `L ${xSplit.toFixed(2)} ${(CENTER + halfHead).toFixed(2)} ` +
            `L ${xSplit.toFixed(2)} ${(CENTER + halfShaft).toFixed(2)} ` +
            `L ${xTail.toFixed(2)} ${(CENTER + halfShaft).toFixed(2)} Z`;
  return wrapSvg(`  <path d="${d}" fill="currentColor" />`);
}

export function generateCompassNeedle(length: number, width: number, strokeWidth: number = 4): string {
  const halfL = length / 2;
  const halfW = width / 2;
  const pTop = [CENTER, CENTER - halfL];
  const pBot = [CENTER, CENTER + halfL];
  const pLeft = [CENTER - halfW, CENTER];
  const pRight = [CENTER + halfW, CENTER];
  const dTopLeft = `M ${CENTER} ${CENTER} L ${pTop[0]} ${pTop[1]} L ${pLeft[0]} ${pLeft[1]} Z`;
  const dBotRight = `M ${CENTER} ${CENTER} L ${pBot[0]} ${pBot[1]} L ${pRight[0]} ${pRight[1]} Z`;
  const dOuter = `M ${pTop[0]} ${pTop[1]} L ${pRight[0]} ${pRight[1]} L ${pBot[0]} ${pBot[1]} L ${pLeft[0]} ${pLeft[1]} Z`;
  return wrapSvg(`  <path d="${dTopLeft}" fill="currentColor" stroke="none" />\n  <path d="${dBotRight}" fill="currentColor" stroke="none" />\n  <path d="${dOuter}" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linejoin="miter" stroke-miterlimit="10" />\n  <path d="M ${pTop[0]} ${pTop[1]} L ${pBot[0]} ${pBot[1]}" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="butt" />\n  <path d="M ${pLeft[0]} ${pLeft[1]} L ${pRight[0]} ${pRight[1]}" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="butt" />`);
}
