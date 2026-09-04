import { describe, it, expect, afterEach } from 'vitest';

import { getChartImageBlob, getChartSvgString } from './download.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const cleanup: (() => void)[] = [];

afterEach(() => {
  while (cleanup.length) cleanup.pop()!();
});

/**
 * Mount a chart-like container with a single `.lc-layout-svg` layer whose gradient stops take
 * their colors from CSS variables (how `<LinearGradient>` picks up Tailwind `from-*`/`to-*`
 * classes) rather than literal `stop-color` values.
 */
function mountGradientChart(width = 100, height = 100) {
  const style = document.createElement('style');
  style.textContent = `
    .test-gradient-stops {
      --test-gradient-from: rgb(0, 100, 255);
      --test-gradient-to: rgb(255, 0, 0);
    }
  `;
  document.head.appendChild(style);

  const container = document.createElement('div');
  // Fixed/pointer-events-none so the layer has real dimensions without joining the page flow or
  // catching the pointer (the browser suite shares a single cursor across files).
  container.style.cssText = `position: fixed; top: 0; left: 0; pointer-events: none;`;
  container.innerHTML = `
    <svg class="lc-layout-svg" width="${width}" height="${height}">
      <defs>
        <linearGradient id="test-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="var(--test-gradient-from)" class="test-gradient-stops" />
          <stop offset="100%" stop-color="var(--test-gradient-to)" class="test-gradient-stops" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${width}" height="${height}" fill="url(#test-gradient)" />
    </svg>
  `;
  document.body.appendChild(container);

  cleanup.push(() => {
    container.remove();
    style.remove();
  });

  return container;
}

/** Decode an image blob and return an `(x, y) => [r, g, b, a]` pixel sampler */
async function readPixels(blob: Blob, width: number, height: number) {
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  return (x: number, y: number) => Array.from(ctx.getImageData(x, y, 1, 1).data);
}

// ---------------------------------------------------------------------------
// getChartImageBlob
// ---------------------------------------------------------------------------

describe('getChartImageBlob', () => {
  it('rasterises gradient stops whose colors come from CSS variables', async () => {
    const container = mountGradientChart();

    const blob = await getChartImageBlob(container);
    const pixel = await readPixels(blob, 100, 100);

    // Sampled a few pixels in from each edge so gradient interpolation and antialiasing along
    // the very first/last row don't skew the comparison.
    const [topR, topG, topB] = pixel(50, 3);
    expect(topR).toBeLessThan(50);
    expect(topG).toBeGreaterThan(70);
    expect(topB).toBeGreaterThan(200);

    const [bottomR, bottomG, bottomB] = pixel(50, 97);
    expect(bottomR).toBeGreaterThan(200);
    expect(bottomG).toBeLessThan(50);
    expect(bottomB).toBeLessThan(50);
  });
});

// ---------------------------------------------------------------------------
// getChartSvgString
// ---------------------------------------------------------------------------

describe('getChartSvgString', () => {
  it('inlines resolved `stop-color` on gradient stops', () => {
    const container = mountGradientChart();

    const svg = getChartSvgString(container)!;
    expect(svg).toContain('stop-color: rgb(0, 100, 255)');
    expect(svg).toContain('stop-color: rgb(255, 0, 0)');
  });

  it('does not inline `stop-color` on elements that are not gradient stops', () => {
    const container = mountGradientChart();

    const svg = getChartSvgString(container)!;
    // `<rect>` computes to the `stop-color` initial value (black) — inlining it everywhere would
    // bloat the output for no effect
    expect(svg).not.toMatch(/<rect[^>]*stop-color/);
  });

  it('returns null when the container has no SVG layers', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    cleanup.push(() => container.remove());

    expect(getChartSvgString(container)).toBe(null);
  });
});
