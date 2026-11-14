/**
 * Elevation anywhere on Earth, from the open terrain tiles AWS hosts (Mapzen's "Terrarium"
 * encoding: meters = red × 256 + green + blue / 256 - 32768).  Tiles are Web Mercator, fetched
 * in the browser and decoded through a canvas.
 *
 * Data: https://registry.opendata.aws/terrain-tiles/ (SRTM, GMTED, ETOPO1, NED, and others)
 */

const TILE_SIZE = 256;
const URL = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium';

type Bounds = [[west: number, south: number], [east: number, north: number]];

/** Longitude / latitude to pixels across the whole Web Mercator world at `zoom` */
function mercator(longitude: number, latitude: number, zoom: number): [number, number] {
	const size = TILE_SIZE * 2 ** zoom;
	const φ = (Math.max(-85.05, Math.min(85.05, latitude)) * Math.PI) / 180;
	return [
		((longitude + 180) / 360) * size,
		((1 - Math.log(Math.tan(φ) + 1 / Math.cos(φ)) / Math.PI) / 2) * size
	];
}

function loadImage(src: string) {
	return new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();
		image.crossOrigin = 'anonymous';
		image.onload = () => resolve(image);
		image.onerror = reject;
		image.src = src;
	});
}

/**
 * Loads the tiles covering `bounds` at `zoom` (each step doubles the detail, and quadruples the
 * tiles), and returns elevation in meters at a longitude / latitude, bilinearly interpolated
 * (`NaN` outside the bounds).  Below sea level is the ocean floor.
 */
export async function loadElevation({ bounds, zoom }: { bounds: Bounds; zoom: number }) {
	const [[west, south], [east, north]] = bounds;
	// Within the world's tiles: at ±85° a bound sits on the last row's far edge
	const tile = (v: number) => Math.min(2 ** zoom - 1, Math.max(0, Math.floor(v / TILE_SIZE)));
	const [x0, y0] = mercator(west, north, zoom).map(tile);
	const [x1, y1] = mercator(east, south, zoom).map(tile);
	const columns = x1 - x0 + 1;
	const rows = y1 - y0 + 1;
	const width = columns * TILE_SIZE;
	const height = rows * TILE_SIZE;

	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext('2d', { willReadFrequently: true })!;
	const tiles = [];
	for (let y = y0; y <= y1; y++) {
		for (let x = x0; x <= x1; x++) {
			tiles.push(
				loadImage(`${URL}/${zoom}/${x}/${y}.png`).then((image) =>
					context.drawImage(image, (x - x0) * TILE_SIZE, (y - y0) * TILE_SIZE)
				)
			);
		}
	}
	await Promise.all(tiles);

	const pixels = context.getImageData(0, 0, width, height).data;
	const meters = new Float32Array(width * height);
	for (let i = 0; i < meters.length; i++) {
		meters[i] = pixels[i * 4] * 256 + pixels[i * 4 + 1] + pixels[i * 4 + 2] / 256 - 32768;
	}

	return (longitude: number, latitude: number) => {
		if (longitude < west || longitude > east || latitude < south || latitude > north) return NaN;
		const [px, py] = mercator(longitude, latitude, zoom);
		const x = Math.min(width - 1.001, Math.max(0, px - x0 * TILE_SIZE - 0.5));
		const y = Math.min(height - 1.001, Math.max(0, py - y0 * TILE_SIZE - 0.5));
		const i = Math.floor(x);
		const j = Math.floor(y);
		const tx = x - i;
		const ty = y - j;
		const at = (a: number, b: number) => meters[b * width + a];
		return (
			(at(i, j) * (1 - tx) + at(i + 1, j) * tx) * (1 - ty) +
			(at(i, j + 1) * (1 - tx) + at(i + 1, j + 1) * tx) * ty
		);
	};
}

/**
 * Stitches the map tiles covering `bounds` at `zoom` (any XYZ tile service, ex. satellite
 * imagery) into one canvas, each tile at its own resolution, and returns it with a Web Mercator
 * projection from longitude / latitude to its pixels: ex. for `GeoRaster`'s `image` and
 * `sourceProjection`.  Tiles that fail to load are left blank.
 */
export async function loadTileImage({
	bounds,
	zoom,
	url
}: {
	bounds: Bounds;
	zoom: number;
	url: (x: number, y: number, z: number) => string;
}) {
	const [[west, south], [east, north]] = bounds;
	const tile = (v: number) => Math.min(2 ** zoom - 1, Math.max(0, Math.floor(v / TILE_SIZE)));
	const [x0, y0] = mercator(west, north, zoom).map(tile);
	const [x1, y1] = mercator(east, south, zoom).map(tile);

	const images = await Promise.all(
		Array.from({ length: (x1 - x0 + 1) * (y1 - y0 + 1) }, (_, i) => {
			const x = x0 + (i % (x1 - x0 + 1));
			const y = y0 + Math.floor(i / (x1 - x0 + 1));
			return loadImage(url(x, y, zoom)).then(
				(image) => ({ image, x, y }),
				() => null
			);
		})
	);
	// Each tile's own size (high-resolution tiles are 512 pixels or more), so none is scaled down
	const size = Math.max(TILE_SIZE, ...images.map((t) => t?.image.naturalWidth ?? 0));
	const canvas = document.createElement('canvas');
	canvas.width = (x1 - x0 + 1) * size;
	canvas.height = (y1 - y0 + 1) * size;
	const context = canvas.getContext('2d')!;
	for (const t of images) {
		if (t) context.drawImage(t.image, (t.x - x0) * size, (t.y - y0) * size, size, size);
	}

	const { geoMercator } = await import('d3-geo');
	// The whole world's Mercator at this zoom, in the canvas' pixels: moved so tile (x0, y0) is at
	// its corner
	const world = size * 2 ** zoom;
	const projection = () =>
		geoMercator()
			.scale(world / (2 * Math.PI))
			.translate([world / 2 - x0 * size, world / 2 - y0 * size]);
	return { image: canvas, projection };
}

/**
 * Whether a longitude / latitude falls inside `geojson`, answered from a canvas the features are
 * filled on — much faster than testing every point against every polygon.
 */
export function createMask(geojson: import('geojson').GeoJSON, size = 2048) {
	return import('d3-geo').then(({ geoEquirectangular, geoPath }) => {
		const projection = geoEquirectangular().fitSize([size, size / 2], geojson as any);
		const canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size / 2;
		const context = canvas.getContext('2d', { willReadFrequently: true })!;
		context.fillStyle = 'black';
		context.beginPath();
		geoPath(projection, context)(geojson as any);
		context.fill();
		const alpha = context.getImageData(0, 0, size, size / 2).data;
		return (longitude: number, latitude: number) => {
			const point = projection([longitude, latitude]);
			if (!point) return false;
			const x = Math.floor(point[0]);
			const y = Math.floor(point[1]);
			if (x < 0 || y < 0 || x >= size || y >= size / 2) return false;
			return alpha[(y * size + x) * 4 + 3] > 127;
		};
	});
}

/**
 * Pixels per meter on the ground where `projection` draws `[longitude, latitude]` — for raising
 * heights in meters at the same scale as the map
 */
export function pixelsPerMeter(
	projection: (point: [number, number]) => [number, number] | null,
	[longitude, latitude]: [number, number]
) {
	// 100m east, in degrees of longitude at this latitude
	const step = 100 / (111_320 * Math.cos((latitude * Math.PI) / 180));
	const a = projection([longitude, latitude]);
	const b = projection([longitude + step, latitude]);
	return a && b ? Math.hypot(b[0] - a[0], b[1] - a[1]) / 100 : 0;
}
