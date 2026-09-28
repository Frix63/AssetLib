import { CENTER, wrapSvg } from '../math';

export function smoothCardinalSpline(points: [number, number][], tension: number = 0.5, closed: boolean = true): string {
  const n = points.length;
  if (n < 3) {
    if (!points.length) return '';
    return 'M ' + points[0][0] + ' ' + points[0][1] + ' ' + points.slice(1).map(p => 'L ' + p[0] + ' ' + p[1]).join(' ') + (closed ? ' Z' : '');
  }
  let pts: [number, number][];
  if (closed) {
    pts = [points[n - 1], ...points, points[0], points[1]];
  } else {
    pts = [points[0], ...points, points[n - 1]];
  }
  const d: string[] = ['M ' + points[0][0].toFixed(2) + ' ' + points[0][1].toFixed(2)];
  for (let i = 1; i < pts.length - 2; i++) {
    const p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6 * (1 - tension) * 2;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6 * (1 - tension) * 2;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6 * (1 - tension) * 2;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6 * (1 - tension) * 2;
    d.push('C ' + cp1x.toFixed(2) + ' ' + cp1y.toFixed(2) + ' ' + cp2x.toFixed(2) + ' ' + cp2y.toFixed(2) + ' ' + p2[0].toFixed(2) + ' ' + p2[1].toFixed(2));
  }
  if (closed) d.push('Z');
  return d.join(' ');
}

export function generateTwistedPolygon(sides: number, layers: number, twist: number, radius: number = 220, strokeWidth: number = 7): string {
  const stepR = radius / layers;
  const paths: string[] = [];
  const angleStep = (2 * Math.PI) / sides;
  for (let layer = 0; layer < layers; layer++) {
    const r = radius - layer * stepR;
    if (r <= 10) continue;
    const rot = (layer * twist * Math.PI) / 180;
    const pts: string[] = [];
    for (let s = 0; s < sides; s++) {
      const a = rot + s * angleStep;
      pts.push((CENTER + r * Math.cos(a)).toFixed(2) + ' ' + (CENTER + r * Math.sin(a)).toFixed(2));
    }
    const d = 'M ' + pts[0] + ' ' + pts.slice(1).map(p => 'L ' + p).join(' ') + ' Z';
    paths.push(`  <path d="${d}" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linejoin="round" />`);
  }
  return wrapSvg(paths.join('\n'));
}

export function generateWaveDisc(waves: number, amp: number, harmonics: number = 1, radius: number = 180): string {
  const steps = 180;
  const stepA = (2 * Math.PI) / steps;
  const pts: [number, number][] = [];
  for (let i = 0; i < steps; i++) {
    const a = i * stepA;
    let r = radius + amp * Math.sin(waves * a);
    if (harmonics > 1) {
      r += (amp * 0.4) * Math.sin(waves * harmonics * a + Math.PI / 4);
    }
    pts.push([CENTER + r * Math.cos(a), CENTER + r * Math.sin(a)]);
  }
  const d = smoothCardinalSpline(pts, 0.45, true);
  return wrapSvg(`  <path d="${d}" fill="currentColor" />`);
}

export function generateRhodoneaRose(k: number, strokeWidth: number = 14, radius: number = 210): string {
  const steps = 360;
  const maxTheta = k % 2 === 0 ? 2 * Math.PI : Math.PI;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * maxTheta;
    const r = radius * Math.cos(k * theta);
    const x = CENTER + r * Math.cos(theta);
    const y = CENTER + r * Math.sin(theta);
    pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  const d = `M ${pts[0]} ` + pts.slice(1).map(p => `L ${p}`).join(' ') + ' Z';
  return wrapSvg(`  <path d="${d}" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linejoin="round" />`);
}

export function generateHypotrochoid(R: number, r: number, d: number, strokeWidth: number = 12): string {
  function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }
  const g = gcd(Math.round(R), Math.round(r));
  const rotations = Math.round(r) / g;
  const totalAngle = rotations * 2 * Math.PI;
  const steps = Math.min(720, Math.max(360, Math.round(rotations * 90)));
  const pts: string[] = [];
  const diff = R - r;
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * totalAngle;
    const x = CENTER + diff * Math.cos(theta) + d * Math.cos((diff / r) * theta);
    const y = CENTER + diff * Math.sin(theta) - d * Math.sin((diff / r) * theta);
    pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  const pathD = `M ${pts[0]} ` + pts.slice(1).map(p => `L ${p}`).join(' ') + ' Z';
  return wrapSvg(`  <path d="${pathD}" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linejoin="round" />`);
}

export function generateLissajous(freqX: number, freqY: number, phaseDeg: number, strokeW: number = 12): string {
  const phase = (phaseDeg * Math.PI) / 180;
  const radius = 200;
  const steps = 360;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 * Math.PI;
    const x = CENTER + radius * Math.sin(freqX * t + phase);
    const y = CENTER + radius * Math.sin(freqY * t);
    pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  const d = 'M ' + pts.join(' L ') + ' Z';
  return wrapSvg(`  <path d="${d}" fill="none" stroke="currentColor" stroke-width="${strokeW}" stroke-linejoin="round" />`);
}

export function generateFlowerOfLife(radius: number, layers: number): string {
  const step = radius / (layers + 1.2);
  const circles: string[] = [];
  circles.push(`  <circle cx="${CENTER}" cy="${CENTER}" r="${step.toFixed(1)}" fill="none" stroke="currentColor" stroke-width="3" />`);
  for (let l = 1; l <= layers; l++) {
    const count = l * 6;
    const ringR = l * step;
    for (let i = 0; i < count; i++) {
      const a = (i * 2 * Math.PI) / count;
      const cx = CENTER + ringR * Math.cos(a);
      const cy = CENTER + ringR * Math.sin(a);
      circles.push(`  <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${step.toFixed(1)}" fill="none" stroke="currentColor" stroke-width="3" />`);
    }
  }
  circles.push(`  <circle cx="${CENTER}" cy="${CENTER}" r="${radius.toFixed(1)}" fill="none" stroke="currentColor" stroke-width="6" />`);
  return wrapSvg(circles.join('\n'));
}

export function generateMetatronCube(radius: number): string {
  const pts: { x: number; y: number }[] = [{ x: CENTER, y: CENTER }];
  const rInner = radius * 0.5;
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    pts.push({ x: CENTER + rInner * Math.cos(a), y: CENTER + rInner * Math.sin(a) });
  }
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    pts.push({ x: CENTER + radius * Math.cos(a), y: CENTER + radius * Math.sin(a) });
  }
  const lines: string[] = [];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      lines.push(`  <line x1="${pts[i].x.toFixed(1)}" y1="${pts[i].y.toFixed(1)}" x2="${pts[j].x.toFixed(1)}" y2="${pts[j].y.toFixed(1)}" stroke="currentColor" stroke-width="2.5" />`);
    }
  }
  const circles = pts.map(p => `  <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(radius * 0.16).toFixed(1)}" fill="none" stroke="currentColor" stroke-width="3" />`);
  return wrapSvg(`${lines.join('\n')}\n${circles.join('\n')}`);
}

export function generateHyperspaceVortex(arms: number, turns: number, strokeW: number = 8): string {
  const rMax = Math.max(60, 216 - strokeW / 2);
  const rMin = Math.max(14, (arms * strokeW) / (2 * Math.PI * 1.35));
  const ptsPerArm = 72;
  const angleStep = (2 * Math.PI) / arms;
  const cmds: string[] = [];

  for (let arm = 0; arm < arms; arm++) {
    const baseAngle = arm * angleStep;
    for (let step = 0; step < ptsPerArm; step++) {
      const t = step / (ptsPerArm - 1);
      const r = rMin + (rMax - rMin) * Math.pow(t, 0.75);
      const theta = baseAngle + t * turns * 2 * Math.PI;
      const x = CENTER + r * Math.cos(theta);
      const y = CENTER + r * Math.sin(theta);
      if (step === 0) {
        cmds.push(`M ${x.toFixed(2)} ${y.toFixed(2)}`);
      } else {
        cmds.push(`L ${x.toFixed(2)} ${y.toFixed(2)}`);
      }
    }
  }

  const d = cmds.join(' ');
  return wrapSvg(`  <path d="${d}" fill="none" stroke="currentColor" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round" />`);
}

