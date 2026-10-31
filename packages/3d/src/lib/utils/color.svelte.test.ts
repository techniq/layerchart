import { afterEach, describe, expect, it } from 'vitest';

import { ColorResolver } from './color.js';

describe('ColorResolver', () => {
  const probe = document.createElement('span');
  probe.style.setProperty('--accent', 'rgb(255, 0, 0)');
  document.body.append(probe);
  afterEach(() => probe.style.setProperty('--accent', 'rgb(255, 0, 0)'));

  const rgb = (value: string, resolver = new ColorResolver(probe)) => {
    const { color, opacity } = resolver.resolve(value);
    const { r, g, b } = color.clone().convertLinearToSRGB();
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), opacity];
  };

  it('resolves custom properties against the probe', () => {
    expect(rgb('var(--accent)')).toEqual([255, 0, 0, 1]);
  });

  it('reads CSS Color 4 spaces three.js cannot parse', () => {
    const [r, g, b] = rgb('oklch(0.628 0.2577 29.23)');
    expect(r).toBeGreaterThan(240);
    expect(g).toBeLessThan(20);
    expect(b).toBeLessThan(20);
  });

  it('keeps alpha as opacity', () => {
    const [r, g, b, opacity] = rgb('color-mix(in srgb, var(--accent) 50%, transparent)');
    expect([r, g, b]).toEqual([255, 0, 0]);
    expect(opacity).toBeCloseTo(0.5, 1);
  });

  it('caches, and refreshes only to report a real change', () => {
    const resolver = new ColorResolver(probe);
    expect(rgb('var(--accent)', resolver)).toEqual([255, 0, 0, 1]);
    expect(resolver.refresh()).toBe(false);

    probe.style.setProperty('--accent', 'rgb(0, 0, 255)');
    expect(rgb('var(--accent)', resolver)).toEqual([255, 0, 0, 1]);
    expect(resolver.refresh()).toBe(true);
    expect(rgb('var(--accent)', resolver)).toEqual([0, 0, 255, 1]);
  });
});
