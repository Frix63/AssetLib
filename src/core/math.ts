export const CENTER = 256;
export const CANVAS_SIZE = 512;

export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180.0;
}

export function radToDeg(radians: number): number {
  return (radians * 180.0) / Math.PI;
}

export function formatNum(val: number, precision: number = 2): number {
  return Number(val.toFixed(precision));
}

export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): [number, number] {
  const rad = degToRad(angleDeg);
  return [
    formatNum(cx + r * Math.cos(rad)),
    formatNum(cy + r * Math.sin(rad))
  ];
}

/**
 * SplitMix32 deterministic pseudo-random number generator.
 * Produces high-quality uniform random floats in [0, 1) from an integer seed.
 */
export function splitmix32(seed: number): () => number {
  let state = seed | 0;
  return function (): number {
    state = (state + 0x9e3779b9) | 0;
    let z = state;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
    return ((z ^ (z >>> 16)) >>> 0) / 4294967296;
  };
}

/**
 * Generates an integer seed between 1 and 999999.
 */
export function randomSeed(): number {
  return Math.floor(Math.random() * 999999) + 1;
}

/**
 * Lightweight SVG document wrapper.
 */
export function wrapSvg(
  content: string,
  width: number = 512,
  height: number = 512,
  viewBox: string = '0 0 512 512'
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}" fill="none">\n${content}\n</svg>`;
}

export function formatName(raw: string): string {
  if (!raw) return '';
  return raw.replace(/^[a-z0-9]+_/, '').replace(/_/g, ' ').toUpperCase();
}

export function formatItemTitle(item: any): string {
  if (!item) return '';
  if (item.title) return item.title.toUpperCase();
  const raw = item.name || item.id || '';
  return formatName(raw);
}

