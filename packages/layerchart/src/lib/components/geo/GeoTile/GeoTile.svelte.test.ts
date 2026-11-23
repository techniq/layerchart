import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import GeoTileHarness from '$lib/tests/GeoTileHarness.svelte';
import { loadedTiles } from '../TileImage/TileImage.shared.svelte.js';

/** A tile filled with one color, as a data URL (so nothing is fetched) */
function solid(color: string) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const context = canvas.getContext('2d')!;
  context.fillStyle = color;
  context.fillRect(0, 0, 256, 256);
  return canvas.toDataURL();
}

/** Distinct colors (and so cache keys) per test and zoom, so none starts out cached from another */
let test = 0;
const color = (z: number) => [(z * 40) % 256, (test * 60) % 256, 120];
const images = new Map<string, string>();
function tint(z: number) {
  const key = color(z).join();
  if (!images.has(key)) images.set(key, solid(`rgb(${key})`));
  return images.get(key)!;
}

/**
 * Images whose URL starts `hold:` don't load until `release()`d, as tiles still on their way
 * over a slow connection
 */
const src = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')!;
let held: { image: HTMLImageElement; url: string }[] = [];
function hold() {
  Object.defineProperty(HTMLImageElement.prototype, 'src', {
    ...src,
    set(this: HTMLImageElement, value: string) {
      if (value.startsWith('hold:')) held.push({ image: this, url: value });
      else src.set!.call(this, value);
    },
  });
}
function release(as: (url: string) => string) {
  for (const { image, url } of held.splice(0)) src.set!.call(image, as(url));
}
afterEach(() => {
  Object.defineProperty(HTMLImageElement.prototype, 'src', src);
  held = [];
});

/** The images loaded for tiles at zoom `z` (one color, so one image) */
const loadedAt = (z: number) =>
  [...loadedTiles].filter(([url]) => url.includes(`#${z}/`)).map(([, t]) => t.href);

/** The tiles (each outlined, with `debug`), those drawn from their own image, and stand-ins */
const outlines = () => document.querySelectorAll('.lc-tile-image-debug-rect');
const own = () => document.querySelectorAll(':scope svg > g image.lc-tile-image');
const standIns = () => [...document.querySelectorAll('svg svg image')] as SVGImageElement[];

describe('GeoTile', () => {
  it('draws a new tile from its loaded parent while its own loads (zooming in)', async () => {
    test++;
    hold();
    let slow = Infinity;
    const url = (x: number, y: number, z: number) =>
      z === slow ? `hold:${test}/${z}/${x}/${y}` : `${tint(z)}#${z}/${x}/${y}`;
    const screen = render(GeoTileHarness, { url, zoomDelta: 0 });
    await expect.poll(() => outlines().length).toBeGreaterThan(0);
    await expect.poll(() => own().length).toBe(outlines().length);
    const z = Number(
      /(\d+)$/.exec(document.querySelector('.lc-tile-image-debug-text')!.textContent!)![1]
    );

    slow = z + 1;
    await screen.rerender({ url, zoomDelta: 1 });
    await expect.poll(() => standIns().length).toBe(outlines().length);
    for (const image of standIns()) expect(loadedAt(z)).toContain(image.getAttribute('href'));

    release((url) => tint(Number(url.split('/')[1])));
    await expect.poll(() => standIns().length).toBe(0);
    await expect.poll(() => own().length).toBe(outlines().length);
  });

  it('draws a new tile from an ancestor loaded with the tiles before (zooming out)', async () => {
    test++;
    hold();
    let slow = Infinity;
    const url = (x: number, y: number, z: number) =>
      z === slow ? `hold:${test}/${z}/${x}/${y}` : `${tint(z)}#${z}/${x}/${y}`;
    const screen = render(GeoTileHarness, { url, zoomDelta: 2 });
    await expect.poll(() => outlines().length).toBeGreaterThan(0);
    await expect.poll(() => own().length).toBe(outlines().length);
    const z = Number(
      /(\d+)$/.exec(document.querySelector('.lc-tile-image-debug-text')!.textContent!)![1]
    );

    // Zoomed out two, the new tiles' parents are the ancestors loaded three zooms up
    slow = z - 2;
    await screen.rerender({ url, zoomDelta: 0 });
    await expect.poll(() => standIns().length).toBe(outlines().length);
    for (const image of standIns()) expect(loadedAt(z - 3)).toContain(image.getAttribute('href'));
  });

  it('draws a new tile from its loaded parent while its own loads, on canvas', async () => {
    test++;
    hold();
    let slow = Infinity;
    const url = (x: number, y: number, z: number) =>
      z === slow ? `hold:${test}/${z}/${x}/${y}` : `${tint(z)}#${z}/${x}/${y}`;
    const screen = render(GeoTileHarness, { url, zoomDelta: 0, layer: 'canvas' });
    const canvas = () => document.querySelector('canvas')!;
    /** The color at the middle of the chart */
    const middle = () => {
      const c = canvas();
      return [...c.getContext('2d')!.getImageData(c.width / 2, c.height / 2, 1, 1).data];
    };
    // Its tiles' zoom: the one whose color is drawn
    await expect.poll(() => middle()[3]).toBe(255);
    const z = [...Array(24).keys()].find((k) => color(k)[0] === middle()[0])!;
    expect(z).toBeDefined();

    slow = z + 1;
    await screen.rerender({ url, zoomDelta: 1, layer: 'canvas' });
    // Its new tiles are held, so what's drawn is the parent's, rather than nothing
    await expect.poll(() => held.length).toBeGreaterThan(0);
    expect(middle().slice(0, 3)).toEqual(color(z));

    release((url) => tint(Number(url.split('/')[1])));
    await expect.poll(() => middle().slice(0, 3)).toEqual(color(slow));
  });
});
