import { CENTER, wrapSvg } from '../math';

export function generatePinchStar(points: number, pinchFraction: number, rOuter: number = 210): string {
  const angleStep = (2 * Math.PI) / points;
  const cmds: string[] = [];
  const rot = -Math.PI / 2;
  for (let i = 0; i < points; i++) {
    const aTip = rot + i * angleStep;
    const aNext = rot + (i + 1) * angleStep;
    const pTip = [CENTER + rOuter * Math.cos(aTip), CENTER + rOuter * Math.sin(aTip)];
    const pNext = [CENTER + rOuter * Math.cos(aNext), CENTER + rOuter * Math.sin(aNext)];
    const rInner = rOuter * (1.0 - pinchFraction);
    const cpDist = rInner * 1.2;
    const cp1 = [CENTER + cpDist * Math.cos(aTip + angleStep * 0.25), CENTER + cpDist * Math.sin(aTip + angleStep * 0.25)];
    const cp2 = [CENTER + cpDist * Math.cos(aNext - angleStep * 0.25), CENTER + cpDist * Math.sin(aNext - angleStep * 0.25)];
    if (i === 0) cmds.push(`M ${pTip[0].toFixed(2)} ${pTip[1].toFixed(2)}`);
    cmds.push(`C ${cp1[0].toFixed(2)} ${cp1[1].toFixed(2)} ${cp2[0].toFixed(2)} ${cp2[1].toFixed(2)} ${pNext[0].toFixed(2)} ${pNext[1].toFixed(2)}`);
  }
  cmds.push('Z');
  return wrapSvg(`  <path d="${cmds.join(' ')}" fill="currentColor" />`);
}

export function generateCutoutStar(points: number, holeRadius: number, rOuter: number = 210, pinch: number = 0.55): string {
  const angleStep = (2 * Math.PI) / points;
  const cmds: string[] = [];
  const rot = -Math.PI / 2;
  for (let i = 0; i < points; i++) {
    const aTip = rot + i * angleStep;
    const aNext = rot + (i + 1) * angleStep;
    const pTip = [CENTER + rOuter * Math.cos(aTip), CENTER + rOuter * Math.sin(aTip)];
    const pNext = [CENTER + rOuter * Math.cos(aNext), CENTER + rOuter * Math.sin(aNext)];
    const rInner = rOuter * (1.0 - pinch);
    const cpDist = rInner * 1.2;
    const cp1 = [CENTER + cpDist * Math.cos(aTip + angleStep * 0.25), CENTER + cpDist * Math.sin(aTip + angleStep * 0.25)];
    const cp2 = [CENTER + cpDist * Math.cos(aNext - angleStep * 0.25), CENTER + cpDist * Math.sin(aNext - angleStep * 0.25)];
    if (i === 0) cmds.push(`M ${pTip[0].toFixed(2)} ${pTip[1].toFixed(2)}`);
    cmds.push(`C ${cp1[0].toFixed(2)} ${cp1[1].toFixed(2)} ${cp2[0].toFixed(2)} ${cp2[1].toFixed(2)} ${pNext[0].toFixed(2)} ${pNext[1].toFixed(2)}`);
  }
  cmds.push('Z');
  const dStar = cmds.join(' ');
  const dHole = `M ${CENTER - holeRadius} ${CENTER} A ${holeRadius} ${holeRadius} 0 1 0 ${CENTER + holeRadius} ${CENTER} A ${holeRadius} ${holeRadius} 0 1 0 ${CENTER - holeRadius} ${CENTER} Z`;
  return wrapSvg(`  <path d="${dStar} ${dHole}" fill="currentColor" fill-rule="evenodd" />`);
}

export function generatePolygonStar(points: number, rOuter: number, rInner: number, strokeW: number = 0): string {
  const total = points * 2;
  const step = (2 * Math.PI) / total;
  const pts: string[] = [];
  for (let i = 0; i < total; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = -Math.PI / 2 + i * step;
    pts.push(`${(CENTER + r * Math.cos(a)).toFixed(2)} ${(CENTER + r * Math.sin(a)).toFixed(2)}`);
  }
  const d = 'M ' + pts.join(' L ') + ' Z';
  if (strokeW > 0) {
    return wrapSvg(`  <path d="${d}" fill="none" stroke="currentColor" stroke-width="${strokeW}" stroke-linejoin="round" />`);
  }
  return wrapSvg(`  <path d="${d}" fill="currentColor" />`);
}

export function generateLensSparkle(rVert: number, rHoriz: number, pinch: number): string {
  const radii = [rVert, rHoriz, rVert, rHoriz];
  const cmds: string[] = [];
  for (let i = 0; i < 4; i++) {
    const aTip = -Math.PI / 2 + i * (Math.PI / 2);
    const aNext = aTip + (Math.PI / 2);
    const r1 = radii[i];
    const r2 = radii[(i + 1) % 4];
    const p1 = [CENTER + r1 * Math.cos(aTip), CENTER + r1 * Math.sin(aTip)];
    const p2 = [CENTER + r2 * Math.cos(aNext), CENTER + r2 * Math.sin(aNext)];
    const midR = Math.min(r1, r2) * (1.0 - pinch);
    const cp1 = [CENTER + midR * Math.cos(aTip + Math.PI / 8), CENTER + midR * Math.sin(aTip + Math.PI / 8)];
    const cp2 = [CENTER + midR * Math.cos(aNext - Math.PI / 8), CENTER + midR * Math.sin(aNext - Math.PI / 8)];
    if (i === 0) cmds.push(`M ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`);
    cmds.push(`C ${cp1[0].toFixed(2)} ${cp1[1].toFixed(2)} ${cp2[0].toFixed(2)} ${cp2[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`);
  }
  cmds.push('Z');
  return wrapSvg(`  <path d="${cmds.join(' ')}" fill="currentColor" />`);
}

export function generateCompassStar(rMain: number, rSub: number, rInner: number): string {
  const pts: string[] = [];
  const step = (2 * Math.PI) / 16;
  for (let i = 0; i < 16; i++) {
    let r = rInner;
    if (i % 4 === 0) r = rMain;
    else if (i % 2 === 0) r = rSub;
    const a = -Math.PI / 2 + i * step;
    pts.push(`${(CENTER + r * Math.cos(a)).toFixed(2)} ${(CENTER + r * Math.sin(a)).toFixed(2)}`);
  }
  const d = 'M ' + pts.join(' L ') + ' Z';
  return wrapSvg(`  <path d="${d}" fill="currentColor" />`);
}
