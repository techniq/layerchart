import type { SVGAttributes } from 'svelte/elements';
import { SvelteMap } from 'svelte/reactivity';
import type { Without } from '$lib/utils/types.js';

/** A tile's image: to draw on canvas, and as a data URI for SVG (kept with the chart's markup) */
export type LoadedTile = { image: HTMLImageElement; href: string };

/** How many tiles are kept, the least recently wanted let go first */
const cacheSize = 512;

/** Tiles loading or loaded, by URL, the most recently wanted last */
export const tileCache = new Map<string, Promise<LoadedTile>>();

/**
 * Tiles loaded, by URL: reactive, so a tile drawing part of an ancestor's image while its own
 * loads follows ancestors as they arrive
 */
export const loadedTiles = new SvelteMap<string, LoadedTile>();

/** A tile's image, from those loaded before when it can be */
export function loadTile(url: string): Promise<LoadedTile> {
  let promise = tileCache.get(url);
  if (promise) {
    // The most recently wanted, last
    tileCache.delete(url);
    tileCache.set(url, promise);
    return promise;
  }
  promise = new Promise<LoadedTile>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext('2d')!.drawImage(image, 0, 0);
      const tile = { image, href: canvas.toDataURL('image/jpeg') };
      // Unless let go while loading
      if (tileCache.get(url) === promise) loadedTiles.set(url, tile);
      resolve(tile);
    };
    image.onerror = (error) => {
      // Forgotten, so it's tried again later
      if (tileCache.get(url) === promise) tileCache.delete(url);
      reject(error);
    };
    image.src = url;
  });
  tileCache.set(url, promise);
  while (tileCache.size > cacheSize) {
    const oldest = tileCache.keys().next().value!;
    tileCache.delete(oldest);
    loadedTiles.delete(oldest);
  }
  return promise;
}

/** The tile `levels` zooms up from `[x, y, z]`, and where in it `[x, y, z]` is (as shares of it) */
export function tileAncestor(x: number, y: number, z: number, levels: number) {
  const k = 2 ** levels;
  const ax = Math.floor(x / k);
  const ay = Math.floor(y / k);
  return { x: ax, y: ay, z: z - levels, u0: x / k - ax, v0: y / k - ay, size: 1 / k };
}

/** How many zooms up a tile looks for an ancestor to draw from while its own loads */
const standInLevels = 6;

/**
 * Part of the nearest ancestor of `[x, y, z]` already loaded, to draw (blurrier) in its place
 * while its own loads, rather than leaving it empty
 */
export function loadedAncestor(
  url: (x: number, y: number, z: number) => string,
  x: number,
  y: number,
  z: number
) {
  for (let levels = 1; levels <= Math.min(z, standInLevels); levels++) {
    const part = tileAncestor(x, y, z, levels);
    const tile = loadedTiles.get(url(part.x, part.y, part.z));
    if (tile) return { tile, u0: part.u0, v0: part.v0, size: part.size };
  }
  return null;
}

/**
 * Load a tile, and its ancestor three zooms up: few tiles, shared by many, so the tiles around
 * it (and those zoomed out to) have one to draw from while theirs load
 */
export function loadTileWithAncestor(
  url: (x: number, y: number, z: number) => string,
  x: number,
  y: number,
  z: number
) {
  const promise = loadTile(url(x, y, z));
  if (z > 0) {
    const part = tileAncestor(x, y, z, Math.min(z, 3));
    loadTile(url(part.x, part.y, part.z)).catch(() => {});
  }
  return promise;
}

export type TileImagePropsWithoutHTML = {
  x: number;
  y: number;
  z: number;
  tx: number;
  ty: number;
  scale: number;
  /** @default false */
  disableCache?: boolean;
  /** @default false */
  debug?: boolean;
  url: (x: number, y: number, z: number) => string;
};

export type TileImageProps = TileImagePropsWithoutHTML &
  Omit<Without<SVGAttributes<SVGImageElement>, TileImagePropsWithoutHTML>, 'href'>;
