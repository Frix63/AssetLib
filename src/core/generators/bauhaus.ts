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

export function generateConcentricSemis(rings: number, rad: number, rounded: boolean = true): string {
  const paths: string[] = [];
  const sw = rad / (rings * 2.2);
  const cap = rounded ? 'round' : 'square';
  for (let i = 0; i < rings; i++) {
    const r = rad - i * (rad / rings);
    paths.push(`<path d="M ${(CENTER - r).toFixed(1)} ${CENTER.toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${(CENTER + r).toFixed(1)} ${CENTER.toFixed(1)}" fill="none" stroke="currentColor" stroke-width="${sw.toFixed(1)}" stroke-linecap="${cap}" />`);
  }
  return wrapSvg(`  ${paths.join('\n  ')}`);
}

export function generateBauhausPills(length: number, width: number, style: string = 'round'): string {
  const r = width / 2;
  const halfL = length / 2;
  const xL = CENTER - halfL;
  const xR = CENTER + halfL;
  const yT = CENTER - r;
  const yB = CENTER + r;
  let d = '';

  if (style === 'sharp') {
    d = `M ${xL.toFixed(1)} ${yT.toFixed(1)} L ${xR.toFixed(1)} ${yT.toFixed(1)} L ${xR.toFixed(1)} ${yB.toFixed(1)} L ${xL.toFixed(1)} ${yB.toFixed(1)} Z`;
  } else if (style === 'semi') {
    d = `M ${xL.toFixed(1)} ${yT.toFixed(1)} L ${(xR - r).toFixed(1)} ${yT.toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${(xR - r).toFixed(1)} ${yB.toFixed(1)} L ${xL.toFixed(1)} ${yB.toFixed(1)} Z`;
  } else if (style === 'chamfer') {
    const c = Math.min(24, r * 0.6);
    d = `M ${(xL + c).toFixed(1)} ${yT.toFixed(1)} L ${(xR - c).toFixed(1)} ${yT.toFixed(1)} L ${xR.toFixed(1)} ${(yT + c).toFixed(1)} L ${xR.toFixed(1)} ${(yB - c).toFixed(1)} L ${(xR - c).toFixed(1)} ${yB.toFixed(1)} L ${(xL + c).toFixed(1)} ${yB.toFixed(1)} L ${xL.toFixed(1)} ${(yB - c).toFixed(1)} L ${xL.toFixed(1)} ${(yT + c).toFixed(1)} Z`;
  } else {
    d = `M ${(xL + r).toFixed(1)} ${yT.toFixed(1)} L ${(xR - r).toFixed(1)} ${yT.toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${(xR - r).toFixed(1)} ${yB.toFixed(1)} L ${(xL + r).toFixed(1)} ${yB.toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${(xL + r).toFixed(1)} ${yT.toFixed(1)} Z`;
  }
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

function makeRoundedTrianglePath(cx: number, cy: number, side: number, rc: number): string {
  const h = (side * Math.sqrt(3)) / 2;
  const maxRc = (side / 2) / Math.sqrt(3) * 0.8;
  const rCorner = Math.min(rc, maxRc);
  const t = rCorner * Math.sqrt(3);

  const v1X = cx + side / 2;
  const v1Y = cy + h / 2;
  const v2X = cx - side / 2;
  const v2Y = cy + h / 2;

  const p0Exit = [cx + t * 0.5, cy - h / 2 + t * Math.sqrt(3) * 0.5];
  const p0Entry = [cx - t * 0.5, cy - h / 2 + t * Math.sqrt(3) * 0.5];

  const p1Entry = [v1X - t * 0.5, v1Y - t * Math.sqrt(3) * 0.5];
  const p1Exit = [v1X - t, v1Y];

  const p2Entry = [v2X + t, v2Y];
  const p2Exit = [v2X + t * 0.5, v2Y - t * Math.sqrt(3) * 0.5];

  return `M ${p0Exit[0].toFixed(1)} ${p0Exit[1].toFixed(1)} L ${p1Entry[0].toFixed(1)} ${p1Entry[1].toFixed(1)} A ${rCorner.toFixed(1)} ${rCorner.toFixed(1)} 0 0 1 ${p1Exit[0].toFixed(1)} ${p1Exit[1].toFixed(1)} L ${p2Entry[0].toFixed(1)} ${p2Entry[1].toFixed(1)} A ${rCorner.toFixed(1)} ${rCorner.toFixed(1)} 0 0 1 ${p2Exit[0].toFixed(1)} ${p2Exit[1].toFixed(1)} L ${p0Entry[0].toFixed(1)} ${p0Entry[1].toFixed(1)} A ${rCorner.toFixed(1)} ${rCorner.toFixed(1)} 0 0 1 ${p0Exit[0].toFixed(1)} ${p0Exit[1].toFixed(1)} Z`;
}

export function generateBauhausTriangle(
  levels: number,
  size: number,
  strokeWidth: number,
  rounded: boolean = false
): string {
  const paths: string[] = [];
  const h = (size * Math.sqrt(3)) / 2;

  if (strokeWidth > 0) {
    const join = rounded ? 'round' : 'miter';
    const cap = rounded ? 'round' : 'square';
    for (let i = 0; i < levels; i++) {
      const scale = 1.0 - (i / levels) * 0.75;
      const s = size * scale;
      const curH = (s * Math.sqrt(3)) / 2;
      const yTop = CENTER - curH / 2;
      const yBase = CENTER + curH / 2;
      const xLeft = CENTER - s / 2;
      const xRight = CENTER + s / 2;

      let d = '';
      if (rounded) {
        const rc = Math.min(20, s * 0.12);
        d = makeRoundedTrianglePath(CENTER, CENTER, s, rc);
      } else {
        d = `M ${CENTER.toFixed(1)} ${yTop.toFixed(1)} L ${xRight.toFixed(1)} ${yBase.toFixed(1)} L ${xLeft.toFixed(1)} ${yBase.toFixed(1)} Z`;
      }
      paths.push(
        `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="${cap}" stroke-linejoin="${join}" stroke-miterlimit="10" />`
      );
    }
    return wrapSvg(`  ${paths.join('\n  ')}`);
  } else {
    let dOut = '';
    let dIn = '';
    if (rounded) {
      const rcOut = Math.min(28, size * 0.12);
      dOut = makeRoundedTrianglePath(CENTER, CENTER, size, rcOut);
      const sIn = size * 0.55;
      const rcIn = Math.min(16, sIn * 0.12);
      dIn = makeRoundedTrianglePath(CENTER, CENTER, sIn, rcIn);
    } else {
      const yTop = CENTER - h / 2;
      const yBase = CENTER + h / 2;
      dOut = `M ${CENTER.toFixed(1)} ${yTop.toFixed(1)} L ${(CENTER + size / 2).toFixed(1)} ${yBase.toFixed(1)} L ${(CENTER - size / 2).toFixed(1)} ${yBase.toFixed(1)} Z`;
      const sIn = size * 0.55;
      const hIn = (sIn * Math.sqrt(3)) / 2;
      const yTopIn = CENTER - hIn / 2;
      const yBaseIn = CENTER + hIn / 2;
      dIn = `M ${CENTER.toFixed(1)} ${yTopIn.toFixed(1)} L ${(CENTER - sIn / 2).toFixed(1)} ${yBaseIn.toFixed(1)} L ${(CENTER + sIn / 2).toFixed(1)} ${yBaseIn.toFixed(1)} Z`;
    }
    return wrapSvg(`  <path d="${dOut} ${dIn}" fill="currentColor" fill-rule="evenodd" />`);
  }
}

export function generateBauhausSplitDisc(
  radius: number,
  offset: number,
  isRing: boolean = false,
  rounded: boolean = false
): string {
  const dHalf = offset / 2;
  const topY = CENTER - dHalf;
  const botY = CENTER + dHalf;
  const paths: string[] = [];

  if (!isRing) {
    if (!rounded) {
      const topD = `M ${(CENTER - radius).toFixed(1)} ${topY.toFixed(1)} A ${radius.toFixed(1)} ${radius.toFixed(1)} 0 0 1 ${(CENTER + radius).toFixed(1)} ${topY.toFixed(1)} Z`;
      const botD = `M ${(CENTER + radius).toFixed(1)} ${botY.toFixed(1)} A ${radius.toFixed(1)} ${radius.toFixed(1)} 0 0 1 ${(CENTER - radius).toFixed(1)} ${botY.toFixed(1)} Z`;
      paths.push(`<path d="${topD}" fill="currentColor" />`);
      paths.push(`<path d="${botD}" fill="currentColor" />`);
    } else {
      const cr = Math.min(20, offset * 0.55, radius * 0.15);
      const topD = `M ${(CENTER - radius + cr).toFixed(1)} ${topY.toFixed(1)} L ${(CENTER + radius - cr).toFixed(1)} ${topY.toFixed(1)} A ${cr.toFixed(1)} ${cr.toFixed(1)} 0 0 0 ${(CENTER + radius).toFixed(1)} ${(topY - cr).toFixed(1)} A ${radius.toFixed(1)} ${radius.toFixed(1)} 0 0 0 ${(CENTER - radius).toFixed(1)} ${(topY - cr).toFixed(1)} A ${cr.toFixed(1)} ${cr.toFixed(1)} 0 0 0 ${(CENTER - radius + cr).toFixed(1)} ${topY.toFixed(1)} Z`;
      const botD = `M ${(CENTER + radius - cr).toFixed(1)} ${botY.toFixed(1)} L ${(CENTER - radius + cr).toFixed(1)} ${botY.toFixed(1)} A ${cr.toFixed(1)} ${cr.toFixed(1)} 0 0 0 ${(CENTER - radius).toFixed(1)} ${(botY + cr).toFixed(1)} A ${radius.toFixed(1)} ${radius.toFixed(1)} 0 0 0 ${(CENTER + radius).toFixed(1)} ${(botY + cr).toFixed(1)} A ${cr.toFixed(1)} ${cr.toFixed(1)} 0 0 0 ${(CENTER + radius - cr).toFixed(1)} ${botY.toFixed(1)} Z`;
      paths.push(`<path d="${topD}" fill="currentColor" />`);
      paths.push(`<path d="${botD}" fill="currentColor" />`);
    }
  } else {
    const inR = radius * 0.55;
    if (!rounded) {
      const topD = `M ${(CENTER - radius).toFixed(1)} ${topY.toFixed(1)} A ${radius.toFixed(1)} ${radius.toFixed(1)} 0 0 1 ${(CENTER + radius).toFixed(1)} ${topY.toFixed(1)} L ${(CENTER + inR).toFixed(1)} ${topY.toFixed(1)} A ${inR.toFixed(1)} ${inR.toFixed(1)} 0 0 0 ${(CENTER - inR).toFixed(1)} ${topY.toFixed(1)} Z`;
      const botD = `M ${(CENTER + radius).toFixed(1)} ${botY.toFixed(1)} A ${radius.toFixed(1)} ${radius.toFixed(1)} 0 0 1 ${(CENTER - radius).toFixed(1)} ${botY.toFixed(1)} L ${(CENTER - inR).toFixed(1)} ${botY.toFixed(1)} A ${inR.toFixed(1)} ${inR.toFixed(1)} 0 0 0 ${(CENTER + inR).toFixed(1)} ${botY.toFixed(1)} Z`;
      paths.push(`<path d="${topD}" fill="currentColor" />`);
      paths.push(`<path d="${botD}" fill="currentColor" />`);
    } else {
      const cr = Math.min(12, (radius - inR) * 0.2, offset * 0.35);
      const topD = `M ${(CENTER - radius + cr).toFixed(1)} ${topY.toFixed(1)} A ${cr.toFixed(1)} ${cr.toFixed(1)} 0 0 1 ${(CENTER - radius).toFixed(1)} ${(topY - cr).toFixed(1)} A ${radius.toFixed(1)} ${radius.toFixed(1)} 0 0 1 ${(CENTER + radius).toFixed(1)} ${(topY - cr).toFixed(1)} A ${cr.toFixed(1)} ${cr.toFixed(1)} 0 0 1 ${(CENTER + radius - cr).toFixed(1)} ${topY.toFixed(1)} L ${(CENTER + inR + cr).toFixed(1)} ${topY.toFixed(1)} A ${cr.toFixed(1)} ${cr.toFixed(1)} 0 0 1 ${(CENTER + inR).toFixed(1)} ${(topY - cr).toFixed(1)} A ${inR.toFixed(1)} ${inR.toFixed(1)} 0 0 0 ${(CENTER - inR).toFixed(1)} ${(topY - cr).toFixed(1)} A ${cr.toFixed(1)} ${cr.toFixed(1)} 0 0 1 ${(CENTER - inR - cr).toFixed(1)} ${topY.toFixed(1)} Z`;
      const botD = `M ${(CENTER + radius - cr).toFixed(1)} ${botY.toFixed(1)} A ${cr.toFixed(1)} ${cr.toFixed(1)} 0 0 1 ${(CENTER + radius).toFixed(1)} ${(botY + cr).toFixed(1)} A ${radius.toFixed(1)} ${radius.toFixed(1)} 0 0 1 ${(CENTER - radius).toFixed(1)} ${(botY + cr).toFixed(1)} A ${cr.toFixed(1)} ${cr.toFixed(1)} 0 0 1 ${(CENTER - radius + cr).toFixed(1)} ${botY.toFixed(1)} L ${(CENTER - inR - cr).toFixed(1)} ${botY.toFixed(1)} A ${cr.toFixed(1)} ${cr.toFixed(1)} 0 0 1 ${(CENTER - inR).toFixed(1)} ${(botY + cr).toFixed(1)} A ${inR.toFixed(1)} ${inR.toFixed(1)} 0 0 0 ${(CENTER + inR).toFixed(1)} ${(botY + cr).toFixed(1)} A ${cr.toFixed(1)} ${cr.toFixed(1)} 0 0 1 ${(CENTER + inR + cr).toFixed(1)} ${botY.toFixed(1)} Z`;
      paths.push(`<path d="${topD}" fill="currentColor" />`);
      paths.push(`<path d="${botD}" fill="currentColor" />`);
    }
  }

  return wrapSvg(`  ${paths.join('\n  ')}`);
}

export function generateBauhausCornerFan(
  rings: number,
  radius: number,
  rounded: boolean = false
): string {
  const paths: string[] = [];
  const sw = radius / (rings * 2.2);
  const ox = CENTER - radius / 2;
  const oy = CENTER + radius / 2;
  const cap = rounded ? 'round' : 'square';

  for (let i = 0; i < rings; i++) {
    const r = radius - i * (radius / rings);
    if (r <= 0) continue;
    const startX = ox + r;
    const startY = oy;
    const endX = ox;
    const endY = oy - r;
    const d = `M ${startX.toFixed(1)} ${startY.toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 0 ${endX.toFixed(1)} ${endY.toFixed(1)}`;
    paths.push(
      `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${sw.toFixed(1)}" stroke-linecap="${cap}" />`
    );
  }

  return wrapSvg(`  ${paths.join('\n  ')}`);
}

export function generateBauhausBotanical(
  leafPairs: number = 3,
  leafStyle: string = 'pointed',
  headStyle: string = 'circle',
  leafSpan: number = 160,
  stemW: number = 14
): string {
  const botY = 448.0;
  const topY = 130.0;
  const stemH = botY - topY;
  const paths: string[] = [];

  // Central stem
  paths.push(`<rect x="${(CENTER - stemW / 2).toFixed(1)}" y="${topY.toFixed(1)}" width="${stemW.toFixed(1)}" height="${stemH.toFixed(1)}" fill="currentColor" />`);

  // Head
  if (headStyle === 'circle') {
    const headR = 38.0;
    const headCy = topY - headR - 6.0;
    paths.push(`<circle cx="${CENTER.toFixed(1)}" cy="${headCy.toFixed(1)}" r="${headR.toFixed(1)}" fill="currentColor" />`);
  } else {
    const headH = 68.0;
    const headW = 40.0;
    const tipY = topY - headH;
    const baseY = topY;
    const dHead = `M ${CENTER.toFixed(1)} ${baseY.toFixed(1)} Q ${(CENTER - headW).toFixed(1)} ${(baseY - headH * 0.5).toFixed(1)} ${CENTER.toFixed(1)} ${tipY.toFixed(1)} Q ${(CENTER + headW).toFixed(1)} ${(baseY - headH * 0.5).toFixed(1)} ${CENTER.toFixed(1)} ${baseY.toFixed(1)} Z`;
    paths.push(`<path d="${dHead}" fill="currentColor" />`);
  }

  // Symmetric leaves
  const stepY = (botY - topY - 60.0) / (leafPairs + 0.2);
  for (let i = 0; i < leafPairs; i++) {
    const ly = botY - 45.0 - i * stepY;
    const leafLen = leafSpan * (1.0 - i * 0.08);
    const tipDy = 32.0;

    const bxL = CENTER - stemW / 2;
    const txL = bxL - leafLen;
    const tyL = ly - tipDy;

    const bxR = CENTER + stemW / 2;
    const txR = bxR + leafLen;
    const tyR = ly - tipDy;

    let dL = '';
    let dR = '';

    if (leafStyle === 'pointed') {
      dL = `M ${bxL.toFixed(1)} ${ly.toFixed(1)} Q ${(bxL - leafLen * 0.3).toFixed(1)} ${(ly - 40).toFixed(1)} ${txL.toFixed(1)} ${tyL.toFixed(1)} Q ${(bxL - leafLen * 0.7).toFixed(1)} ${(ly + 10).toFixed(1)} ${bxL.toFixed(1)} ${ly.toFixed(1)} Z`;
      dR = `M ${bxR.toFixed(1)} ${ly.toFixed(1)} Q ${(bxR + leafLen * 0.3).toFixed(1)} ${(ly - 40).toFixed(1)} ${txR.toFixed(1)} ${tyR.toFixed(1)} Q ${(bxR + leafLen * 0.7).toFixed(1)} ${(ly + 10).toFixed(1)} ${bxR.toFixed(1)} ${ly.toFixed(1)} Z`;
    } else if (leafStyle === 'rounded') {
      dL = `M ${bxL.toFixed(1)} ${ly.toFixed(1)} C ${(bxL - leafLen * 0.3).toFixed(1)} ${(ly - 45).toFixed(1)} ${(txL - 10).toFixed(1)} ${(tyL - 15).toFixed(1)} ${txL.toFixed(1)} ${tyL.toFixed(1)} C ${(txL + 10).toFixed(1)} ${(tyL + 25).toFixed(1)} ${(bxL - leafLen * 0.5).toFixed(1)} ${(ly + 18).toFixed(1)} ${bxL.toFixed(1)} ${ly.toFixed(1)} Z`;
      dR = `M ${bxR.toFixed(1)} ${ly.toFixed(1)} C ${(bxR + leafLen * 0.3).toFixed(1)} ${(ly - 45).toFixed(1)} ${(txR + 10).toFixed(1)} ${(tyR - 15).toFixed(1)} ${txR.toFixed(1)} ${tyR.toFixed(1)} C ${(txR - 10).toFixed(1)} ${(tyR + 25).toFixed(1)} ${(bxR + leafLen * 0.5).toFixed(1)} ${(ly + 18).toFixed(1)} ${bxR.toFixed(1)} ${ly.toFixed(1)} Z`;
    } else {
      const rad = leafLen * 0.5;
      dL = `M ${bxL.toFixed(1)} ${ly.toFixed(1)} L ${txL.toFixed(1)} ${tyL.toFixed(1)} A ${rad.toFixed(1)} ${rad.toFixed(1)} 0 0 0 ${bxL.toFixed(1)} ${ly.toFixed(1)} Z`;
      dR = `M ${bxR.toFixed(1)} ${ly.toFixed(1)} L ${txR.toFixed(1)} ${tyR.toFixed(1)} A ${rad.toFixed(1)} ${rad.toFixed(1)} 0 0 1 ${bxR.toFixed(1)} ${ly.toFixed(1)} Z`;
    }

    paths.push(`<path d="${dL}" fill="currentColor" />`);
    paths.push(`<path d="${dR}" fill="currentColor" />`);
  }

  return wrapSvg(`  ${paths.join('\n  ')}`);
}

export function generateBauhausQuadFlower(
  size: number = 380,
  style: string = 'pointed',
  centerHole: number = 0,
  fullness: number = 1.0
): string {
  const r = size / 2.0;
  const paths: string[] = [];

  if (style === 'pointed') {
    const dPetals: string[] = [];
    for (const angleDeg of [0, 90, 180, 270]) {
      const rad = (angleDeg * Math.PI) / 180;
      const cosA = Math.cos(rad);
      const sinA = Math.sin(rad);
      const tx = CENTER + r * cosA;
      const ty = CENTER + r * sinA;
      const txUnit = -sinA;
      const tyUnit = cosA;
      const w = r * 0.42 * fullness;
      const c1x = CENTER + r * 0.5 * cosA + w * txUnit;
      const c1y = CENTER + r * 0.5 * sinA + w * tyUnit;
      const c2x = CENTER + r * 0.5 * cosA - w * txUnit;
      const c2y = CENTER + r * 0.5 * sinA - w * tyUnit;
      dPetals.push(`M ${CENTER.toFixed(1)} ${CENTER.toFixed(1)} Q ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)} Q ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${CENTER.toFixed(1)} ${CENTER.toFixed(1)} Z`);
    }
    const pathStr = dPetals.join(' ');
    if (centerHole > 0) {
      const holeD = `M ${(CENTER + centerHole).toFixed(1)} ${CENTER.toFixed(1)} A ${centerHole.toFixed(1)} ${centerHole.toFixed(1)} 0 1 0 ${(CENTER - centerHole).toFixed(1)} ${CENTER.toFixed(1)} A ${centerHole.toFixed(1)} ${centerHole.toFixed(1)} 0 1 0 ${(CENTER + centerHole).toFixed(1)} ${CENTER.toFixed(1)} Z`;
      paths.push(`<path d="${pathStr} ${holeD}" fill="currentColor" fill-rule="evenodd" />`);
    } else {
      paths.push(`<path d="${pathStr}" fill="currentColor" />`);
    }
  } else if (style === 'rounded') {
    const dLobes: string[] = [];
    const lobeR = r * 0.52 * fullness;
    for (const angleDeg of [0, 90, 180, 270]) {
      const rad = (angleDeg * Math.PI) / 180;
      const cx = CENTER + (r - lobeR) * Math.cos(rad);
      const cy = CENTER + (r - lobeR) * Math.sin(rad);
      dLobes.push(`M ${(cx + lobeR * Math.cos(rad)).toFixed(1)} ${(cy + lobeR * Math.sin(rad)).toFixed(1)} A ${lobeR.toFixed(1)} ${lobeR.toFixed(1)} 0 1 1 ${(cx - lobeR * Math.cos(rad)).toFixed(1)} ${(cy - lobeR * Math.sin(rad)).toFixed(1)} Z`);
    }
    const pathStr = dLobes.join(' ');
    if (centerHole > 0) {
      const holeD = `M ${(CENTER + centerHole).toFixed(1)} ${CENTER.toFixed(1)} A ${centerHole.toFixed(1)} ${centerHole.toFixed(1)} 0 1 0 ${(CENTER - centerHole).toFixed(1)} ${CENTER.toFixed(1)} A ${centerHole.toFixed(1)} ${centerHole.toFixed(1)} 0 1 0 ${(CENTER + centerHole).toFixed(1)} ${CENTER.toFixed(1)} Z`;
      paths.push(`<path d="${pathStr} ${holeD}" fill="currentColor" fill-rule="evenodd" />`);
    } else {
      paths.push(`<path d="${pathStr}" fill="currentColor" />`);
    }
  } else {
    // astroid
    const dAstroid = `M ${CENTER.toFixed(1)} ${(CENTER - r).toFixed(1)} Q ${CENTER.toFixed(1)} ${CENTER.toFixed(1)} ${(CENTER + r).toFixed(1)} ${CENTER.toFixed(1)} Q ${CENTER.toFixed(1)} ${CENTER.toFixed(1)} ${CENTER.toFixed(1)} ${(CENTER + r).toFixed(1)} Q ${CENTER.toFixed(1)} ${CENTER.toFixed(1)} ${(CENTER - r).toFixed(1)} ${CENTER.toFixed(1)} Q ${CENTER.toFixed(1)} ${CENTER.toFixed(1)} ${CENTER.toFixed(1)} ${(CENTER - r).toFixed(1)} Z`;
    if (centerHole > 0) {
      const holeD = `M ${(CENTER + centerHole).toFixed(1)} ${CENTER.toFixed(1)} A ${centerHole.toFixed(1)} ${centerHole.toFixed(1)} 0 1 0 ${(CENTER - centerHole).toFixed(1)} ${CENTER.toFixed(1)} A ${centerHole.toFixed(1)} ${centerHole.toFixed(1)} 0 1 0 ${(CENTER + centerHole).toFixed(1)} ${CENTER.toFixed(1)} Z`;
      paths.push(`<path d="${dAstroid} ${holeD}" fill="currentColor" fill-rule="evenodd" />`);
    } else {
      paths.push(`<path d="${dAstroid}" fill="currentColor" />`);
    }
  }

  return wrapSvg(`  ${paths.join('\n  ')}`);
}

export function generateBauhausCrestBowl(
  radius: number = 160,
  bowlStyle: string = 'solid',
  crownStyle: string = 'dots',
  count: number = 5,
  rounded: boolean = true
): string {
  const cy = CENTER + 30.0;
  const rimY = cy;
  const paths: string[] = [];

  if (bowlStyle === 'solid') {
    if (!rounded) {
      const bowlD = `M ${(CENTER - radius).toFixed(1)} ${rimY.toFixed(1)} A ${radius.toFixed(1)} ${radius.toFixed(1)} 0 0 0 ${(CENTER + radius).toFixed(1)} ${rimY.toFixed(1)} Z`;
      paths.push(`<path d="${bowlD}" fill="currentColor" />`);
    } else {
      const cr = Math.min(20.0, radius * 0.15);
      const bowlD = `M ${(CENTER - radius + cr).toFixed(1)} ${rimY.toFixed(1)} L ${(CENTER + radius - cr).toFixed(1)} ${rimY.toFixed(1)} A ${cr.toFixed(1)} ${cr.toFixed(1)} 0 0 1 ${(CENTER + radius).toFixed(1)} ${(rimY + cr).toFixed(1)} A ${radius.toFixed(1)} ${radius.toFixed(1)} 0 0 1 ${(CENTER - radius).toFixed(1)} ${(rimY + cr).toFixed(1)} A ${cr.toFixed(1)} ${cr.toFixed(1)} 0 0 1 ${(CENTER - radius + cr).toFixed(1)} ${rimY.toFixed(1)} Z`;
      paths.push(`<path d="${bowlD}" fill="currentColor" />`);
    }
  } else {
    const thick = radius * 0.35;
    const inR = radius - thick;
    if (!rounded) {
      const bowlD = `M ${(CENTER - radius).toFixed(1)} ${rimY.toFixed(1)} A ${radius.toFixed(1)} ${radius.toFixed(1)} 0 0 0 ${(CENTER + radius).toFixed(1)} ${rimY.toFixed(1)} L ${(CENTER + inR).toFixed(1)} ${rimY.toFixed(1)} A ${inR.toFixed(1)} ${inR.toFixed(1)} 0 0 1 ${(CENTER - inR).toFixed(1)} ${rimY.toFixed(1)} Z`;
      paths.push(`<path d="${bowlD}" fill="currentColor" />`);
    } else {
      const er = thick / 2.0;
      const bowlD = `M ${(CENTER - radius).toFixed(1)} ${rimY.toFixed(1)} A ${radius.toFixed(1)} ${radius.toFixed(1)} 0 0 0 ${(CENTER + radius).toFixed(1)} ${rimY.toFixed(1)} A ${er.toFixed(1)} ${er.toFixed(1)} 0 0 0 ${(CENTER + inR).toFixed(1)} ${rimY.toFixed(1)} A ${inR.toFixed(1)} ${inR.toFixed(1)} 0 0 1 ${(CENTER - inR).toFixed(1)} ${rimY.toFixed(1)} A ${er.toFixed(1)} ${er.toFixed(1)} 0 0 0 ${(CENTER - radius).toFixed(1)} ${rimY.toFixed(1)} Z`;
      paths.push(`<path d="${bowlD}" fill="currentColor" />`);
    }
  }

  // Crown crest above bowl rim
  const crownY = rimY - 40.0;
  const span = radius * 1.55;
  const stepX = count > 1 ? span / (count - 1) : 0;
  const startX = CENTER - span / 2.0;

  if (crownStyle === 'dots') {
    const dotR = count > 1 ? Math.min(22.0, stepX * 0.38) : 22.0;
    for (let i = 0; i < count; i++) {
      const dx = startX + i * stepX;
      paths.push(`<circle cx="${dx.toFixed(1)}" cy="${crownY.toFixed(1)}" r="${dotR.toFixed(1)}" fill="currentColor" />`);
    }
  } else {
    const barW = count > 1 ? stepX * 0.45 : 24.0;
    const barH = 55.0;
    const barTop = rimY - barH - 10.0;
    for (let i = 0; i < count; i++) {
      const dx = startX + i * stepX - barW / 2.0;
      if (rounded) {
        const br = Math.min(8.0, barW / 2.0);
        paths.push(
          `<path d="M ${(dx + br).toFixed(1)} ${barTop.toFixed(1)} L ${(dx + barW - br).toFixed(1)} ${barTop.toFixed(1)} A ${br.toFixed(1)} ${br.toFixed(1)} 0 0 1 ${(dx + barW).toFixed(1)} ${(barTop + br).toFixed(1)} L ${(dx + barW).toFixed(1)} ${(rimY - 6).toFixed(1)} L ${dx.toFixed(1)} ${(rimY - 6).toFixed(1)} L ${dx.toFixed(1)} ${(barTop + br).toFixed(1)} A ${br.toFixed(1)} ${br.toFixed(1)} 0 0 1 ${(dx + br).toFixed(1)} ${barTop.toFixed(1)} Z" fill="currentColor" />`
        );
      } else {
        paths.push(`<rect x="${dx.toFixed(1)}" y="${barTop.toFixed(1)}" width="${barW.toFixed(1)}" height="${barH.toFixed(1)}" fill="currentColor" />`);
      }
    }
  }

  return wrapSvg(`  ${paths.join('\n  ')}`);
}

export function generateBauhausPipeRibbon(
  tracks: number = 4,
  strokeW: number = 14,
  topology: string = 'elbow',
  rounded: boolean = true
): string {
  const cap = rounded ? 'round' : 'square';
  const join = rounded ? 'round' : 'miter';
  const pitch = strokeW * 2.1;
  const yBot = 445.0;
  const paths: string[] = [];

  if (topology === 'elbow') {
    const cx = 210.0;
    const cy = 210.0;
    const baseR = 55.0;
    const xRight = 445.0;
    for (let i = 0; i < tracks; i++) {
      const rI = baseR + i * pitch;
      const xI = cx - rI;
      const yI = cy - rI;
      let d = '';
      if (rounded) {
        d = `M ${xI.toFixed(1)} ${yBot.toFixed(1)} L ${xI.toFixed(1)} ${cy.toFixed(1)} A ${rI.toFixed(1)} ${rI.toFixed(1)} 0 0 1 ${cx.toFixed(1)} ${yI.toFixed(1)} L ${xRight.toFixed(1)} ${yI.toFixed(1)}`;
      } else {
        d = `M ${xI.toFixed(1)} ${yBot.toFixed(1)} L ${xI.toFixed(1)} ${yI.toFixed(1)} L ${xRight.toFixed(1)} ${yI.toFixed(1)}`;
      }
      paths.push(
        `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${strokeW.toFixed(1)}" stroke-linecap="${cap}" stroke-linejoin="${join}" stroke-miterlimit="10" />`
      );
    }
  } else if (topology === 'loop_eye') {
    const cy = 240.0;
    const baseR = 60.0;
    const rEye = baseR * 0.42;
    for (let i = 0; i < tracks; i++) {
      const rI = baseR + i * pitch;
      const xl = CENTER - rI;
      const xr = CENTER + rI;
      const yt = cy - rI;
      let d = '';
      if (rounded) {
        d = `M ${xl.toFixed(1)} ${yBot.toFixed(1)} L ${xl.toFixed(1)} ${cy.toFixed(1)} A ${rI.toFixed(1)} ${rI.toFixed(1)} 0 0 1 ${xr.toFixed(1)} ${cy.toFixed(1)} L ${xr.toFixed(1)} ${yBot.toFixed(1)}`;
      } else {
        d = `M ${xl.toFixed(1)} ${yBot.toFixed(1)} L ${xl.toFixed(1)} ${yt.toFixed(1)} L ${xr.toFixed(1)} ${yt.toFixed(1)} L ${xr.toFixed(1)} ${yBot.toFixed(1)}`;
      }
      paths.push(
        `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${strokeW.toFixed(1)}" stroke-linecap="${cap}" stroke-linejoin="${join}" stroke-miterlimit="10" />`
      );
    }
    if (rounded) {
      paths.push(`<circle cx="${CENTER.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rEye.toFixed(1)}" fill="currentColor" />`);
    } else {
      paths.push(`<rect x="${(CENTER - rEye).toFixed(1)}" y="${(cy - rEye).toFixed(1)}" width="${(rEye * 2).toFixed(1)}" height="${(rEye * 2).toFixed(1)}" fill="currentColor" />`);
    }
  } else {
    // serpentine
    const yTop = 67.0;
    const stepX = 130.0;
    for (let i = 0; i < tracks; i++) {
      const offset = (i - (tracks - 1) / 2.0) * pitch;
      const x1 = CENTER - stepX + offset;
      const x2 = CENTER + stepX + offset;
      const yMid1 = CENTER + 50.0;
      const yMid2 = CENTER - 50.0;
      let d = '';
      if (rounded) {
        d = `M ${x1.toFixed(1)} ${yBot.toFixed(1)} L ${x1.toFixed(1)} ${yMid1.toFixed(1)} C ${x1.toFixed(1)} ${CENTER.toFixed(1)} ${x2.toFixed(1)} ${CENTER.toFixed(1)} ${x2.toFixed(1)} ${yMid2.toFixed(1)} L ${x2.toFixed(1)} ${yTop.toFixed(1)}`;
      } else {
        d = `M ${x1.toFixed(1)} ${yBot.toFixed(1)} L ${x1.toFixed(1)} ${CENTER.toFixed(1)} L ${x2.toFixed(1)} ${CENTER.toFixed(1)} L ${x2.toFixed(1)} ${yTop.toFixed(1)}`;
      }
      paths.push(
        `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${strokeW.toFixed(1)}" stroke-linecap="${cap}" stroke-linejoin="${join}" stroke-miterlimit="10" />`
      );
    }
  }

  return wrapSvg(`  ${paths.join('\n  ')}`);
}
