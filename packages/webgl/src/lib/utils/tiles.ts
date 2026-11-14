/**
 * Web Mercator map tiles (`z` / `x` / `y`, as XYZ tile services serve them): which cover a view,
 * where they are on Earth, and loading their images and elevations, cached across the page.
 */

/** A tile, as `[x, y, z]` */
export type Tile = [x: number, y: number, z: number];

/**
 * The tiles covering a `width` × `height` view of a Mercator projection with this `scale` (its
 * `scale()`, the world's radius in pixels) whose `[0, 0]` is at `center`, as `d3-tile` picks
 * them (and so LayerChart's `GeoTile`): at the zoom where a tile is nearest `tileSize` pixels,
 * plus `zoomDelta`.  Tiles off the world's edge are left out.
 */
export function tileCover({
  scale,
  center,
  width,
  height,
  tileSize = 256,
  zoomDelta = 0,
}: {
  scale: number;
  center: [number, number];
  width: number;
  height: number;
  tileSize?: number;
  zoomDelta?: number;
}): Tile[] {
  const world = scale * 2 * Math.PI;
  const z = Math.log2(world / tileSize);
  const z0 = Math.round(Math.max(z + zoomDelta, 0));
  // One tile's width in pixels at that zoom, and where the world's corner is
  const k = Math.pow(2, z - z0) * tileSize;
  const x = center[0] - world / 2;
  const y = center[1] - world / 2;
  const count = 1 << z0;
  const tiles: Tile[] = [];
  const ymin = Math.max(0, Math.floor(-y / k));
  const ymax = Math.min(count, Math.ceil((height - y) / k));
  const xmin = Math.max(0, Math.floor(-x / k));
  const xmax = Math.min(count, Math.ceil((width - x) / k));
  for (let ty = ymin; ty < ymax; ty++)
    for (let tx = xmin; tx < xmax; tx++) tiles.push([tx, ty, z0]);
  return tiles;
}

/** The longitude at a (fractional) tile column `x` at zoom `z` */
export function tileLongitude(x: number, z: number) {
  return (x / 2 ** z) * 360 - 180;
}

/** The latitude at a (fractional) tile row `y` at zoom `z` */
export function tileLatitude(y: number, z: number) {
  const n = Math.PI - (2 * Math.PI * y) / 2 ** z;
  return (Math.atan(Math.sinh(n)) * 180) / Math.PI;
}

/**
 * The tile at zoom `z` (no deeper than `maxZoom`) that `[x, y, z]` lies in, and where `[x, y, z]`
 * is within it: its corner `u0` / `v0` and size `size`, as shares of the ancestor across and down
 */
export function ancestor([x, y, z]: Tile, maxZoom: number) {
  const dz = Math.max(0, z - maxZoom);
  const n = 1 << dz;
  const tile: Tile = [x >> dz, y >> dz, z - dz];
  return { tile, u0: (x - tile[0] * n) / n, v0: (y - tile[1] * n) / n, size: 1 / n };
}

/** How elevation tiles pack meters into their colors */
export type ElevationEncoding = 'terrarium' | 'mapbox';

const decoders: Record<ElevationEncoding, (r: number, g: number, b: number) => number> = {
  // Mapzen's Terrarium (ex. AWS's open terrain tiles, Mapterhorn)
  terrarium: (r, g, b) => r * 256 + g + b / 256 - 32768,
  // Mapbox's Terrain-RGB (ex. MapTiler's)
  mapbox: (r, g, b) => -10000 + (r * 65536 + g * 256 + b) * 0.1,
};

/** A tile's elevation in meters, row by row from its top left corner */
export type ElevationTile = { width: number; height: number; data: Float32Array };

/** Recently loaded tiles, kept (up to a limit) so panning back or remounting doesn't refetch */
class Cache<T> {
  #entries = new Map<string, Promise<T>>();
  /** What's arrived, to draw from at once (ex. an ancestor while a tile loads) */
  #arrived = new Map<string, T>();
  constructor(private limit: number) {}
  /** What's already arrived for `key`, if it has */
  peek(key: string): T | undefined {
    return this.#entries.has(key) ? this.#arrived.get(key) : undefined;
  }
  get(key: string, load: () => Promise<T>) {
    let entry = this.#entries.get(key);
    if (entry) {
      // Most recently used last
      this.#entries.delete(key);
    } else {
      entry = load();
      entry.then(
        (value) => this.#arrived.set(key, value),
        // A failure is forgotten, so it's tried again later
        () => this.#entries.delete(key)
      );
    }
    this.#entries.set(key, entry);
    while (this.#entries.size > this.limit) {
      const oldest = this.#entries.keys().next().value!;
      this.#entries.delete(oldest);
      this.#arrived.delete(oldest);
    }
    return entry;
  }
}

const images = new Cache<HTMLImageElement>(512);
const elevations = new Cache<ElevationTile>(256);

/** A tile's image, cached unless `cache` is false */
export function loadTileImage(url: string, { cache = true } = {}): Promise<HTMLImageElement> {
  const load = () =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });
  return cache ? images.get(url, load) : load();
}

/** A tile's image if it's already loaded (and cached) */
export function peekTileImage(url: string) {
  return images.peek(url);
}

/** A tile's elevation if it's already loaded (and cached) */
export function peekElevationTile(url: string, encoding: ElevationEncoding = 'terrarium') {
  return elevations.peek(`${encoding} ${url}`);
}

/** A tile's elevation in meters, decoded from its colors, cached */
export function loadElevationTile(
  url: string,
  encoding: ElevationEncoding = 'terrarium'
): Promise<ElevationTile> {
  return elevations.get(`${encoding} ${url}`, async () => {
    const image = await loadTileImage(url, { cache: false });
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true })!;
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, width, height).data;
    const decode = decoders[encoding];
    const data = new Float32Array(width * height);
    for (let i = 0; i < data.length; i++) {
      data[i] = decode(pixels[i * 4], pixels[i * 4 + 1], pixels[i * 4 + 2]);
    }
    return { width, height, data };
  });
}

/** Elevation at `u` / `v` (shares across and down) of a tile, between its nearest four pixels */
export function sampleElevation({ width, height, data }: ElevationTile, u: number, v: number) {
  const x = Math.min(width - 1, Math.max(0, u * width - 0.5));
  const y = Math.min(height - 1, Math.max(0, v * height - 0.5));
  const i = Math.floor(x);
  const j = Math.floor(y);
  // The next pixel across and down, or the same one at the far edge
  const i1 = Math.min(i + 1, width - 1);
  const j1 = Math.min(j + 1, height - 1);
  const tx = x - i;
  const ty = y - j;
  const at = (a: number, b: number) => data[b * width + a];
  return (
    (at(i, j) * (1 - tx) + at(i1, j) * tx) * (1 - ty) +
    (at(i, j1) * (1 - tx) + at(i1, j1) * tx) * ty
  );
}
