import { StudioTransformParams } from './types';

/**
 * Transforms an SVG string by applying scale, stretch, rotation, pan, flip,
 * stroke width, dash patterns, and fill/outline modes via DOMParser.
 */
export function applySvgTransforms(rawSvg: string, params: StudioTransformParams): string {
  if (!rawSvg) return '';
  if (typeof DOMParser === 'undefined') return rawSvg;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawSvg, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    if (!svgEl || doc.querySelector('parsererror')) {
      return rawSvg;
    }

    const elements = svgEl.querySelectorAll('path, circle, rect, polygon, polyline, ellipse, line');

    // 1. Outline mode / Stroke width
    if (params.invertFill) {
      elements.forEach(el => {
        el.setAttribute('fill', 'none');
        el.setAttribute('stroke', 'currentColor');
        el.setAttribute('stroke-width', params.strokeWidth > 0 ? String(params.strokeWidth) : '6');
      });
    } else if (params.strokeWidth > 0) {
      const strokedEls = svgEl.querySelectorAll('[stroke]:not([stroke="none"])');
      if (strokedEls.length > 0) {
        strokedEls.forEach(el => el.setAttribute('stroke-width', String(params.strokeWidth)));
      } else {
        elements.forEach(el => {
          el.setAttribute('stroke', 'currentColor');
          el.setAttribute('stroke-width', String(params.strokeWidth));
        });
      }
    }

    // Line Join style
    if (params.cornerJoin && params.cornerJoin !== 'orig') {
      elements.forEach(el => {
        el.setAttribute('stroke-linejoin', params.cornerJoin);
        if (params.cornerJoin === 'miter') el.setAttribute('stroke-miterlimit', '10');
      });
    }

    // Line Dash Pattern
    if (params.dashPattern === 'dashed') {
      elements.forEach(el => {
        el.setAttribute('stroke-dasharray', '14 8');
      });
    } else if (params.dashPattern === 'dotted') {
      elements.forEach(el => {
        el.setAttribute('stroke-dasharray', '2 10');
        el.setAttribute('stroke-linecap', 'round');
      });
    } else if (params.dashPattern === 'solid') {
      elements.forEach(el => {
        el.removeAttribute('stroke-dasharray');
      });
    }

    // 2. Transform Group (Scale, Stretch X, Stretch Y, Rotate, Pan, Flip)
    const { scale, stretchX, stretchY, rotation, panX, panY, flipH, flipV } = params;
    const needsTransform = (
      scale !== 100 ||
      stretchX !== 100 ||
      stretchY !== 100 ||
      rotation !== 0 ||
      panX !== 0 ||
      panY !== 0 ||
      flipH ||
      flipV
    );

    if (needsTransform) {
      const sx = (scale / 100) * (stretchX / 100) * (flipH ? -1 : 1);
      const sy = (scale / 100) * (stretchY / 100) * (flipV ? -1 : 1);
      const transformStr = `translate(${256 + panX} ${256 + panY}) rotate(${rotation}) scale(${sx} ${sy}) translate(-256 -256)`;

      const g = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', transformStr);

      while (svgEl.firstChild) {
        g.appendChild(svgEl.firstChild);
      }
      svgEl.appendChild(g);
    }

    return new XMLSerializer().serializeToString(svgEl);
  } catch (err) {
    console.error('Transform error:', err);
    return rawSvg;
  }
}

/**
 * Converts an SVG string into a ready-to-use React JSX component.
 */
export function svgToReactJsx(rawSvg: string, componentName: string = 'AssetIcon'): string {
  const safeName = componentName
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('') || 'AssetIcon';

  // Convert SVG attributes to React camelCase attributes
  let jsxBody = rawSvg
    .replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, '')
    .replace(/fill-rule=/g, 'fillRule=')
    .replace(/clip-rule=/g, 'clipRule=')
    .replace(/stroke-width=/g, 'strokeWidth=')
    .replace(/stroke-linecap=/g, 'strokeLinecap=')
    .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
    .replace(/stroke-miterlimit=/g, 'strokeMiterlimit=')
    .replace(/stroke-dasharray=/g, 'strokeDasharray=')
    .replace(/clip-path=/g, 'clipPath=')
    .replace(/viewBox=/g, 'viewBox=')
    .replace(/<svg([^>]*)>/, `<svg $1 {...props}>`);

  return `import React from 'react';

export const ${safeName} = (props: React.SVGProps<SVGSVGElement>) => (
  ${jsxBody.trim()}
);
`;
}

/**
 * Downloads a string content as a client-side file.
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'image/svg+xml') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Rasterizes an SVG string into a high-resolution PNG data URL.
 */
export function rasterizeSvgToPng(rawSvg: string, size: number = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas 2D context not available'));
      return;
    }

    const img = new Image();
    const blob = new Blob([rawSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}
