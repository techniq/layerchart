/**
 * An example's screenshot, ready to draw on a card.
 *
 * The screenshots are WebP, which resvg cannot read (it draws nothing in their place), so each is
 * decoded with `@jsquash/webp` and written out again as a PNG.
 */
import { dev } from '$app/environment';
import decode, { init } from '@jsquash/webp/decode.js';

import { base64, type Screenshot } from './draw';

/**
 * Whether the decoder has its WebAssembly.  A Worker refuses to compile WebAssembly from bytes at
 * runtime, so there it is imported as a module (see `vite-plugin-worker-wasm`); `vite dev` runs on
 * Node, which cannot import a `.wasm` file, so there it is read and compiled.
 *
 * Held as a flag and never as a shared promise: an isolate serves many requests at once, and a
 * promise started by one request and awaited by another can be cancelled as hung.  Two cards drawn
 * at once on a cold isolate both instantiate it, which is cheap.
 */
let ready = false;

async function loadDecoder() {
	if (ready) return;
	let module: WebAssembly.Module;
	if (dev) {
		const { readFile } = await import('node:fs/promises');
		const { createRequire } = await import('node:module');
		const path = createRequire(import.meta.url).resolve('@jsquash/webp/codec/dec/webp_dec.wasm');
		module = await WebAssembly.compile(await readFile(path));
	} else {
		// @ts-expect-error - a `.wasm` import, which the Worker loads as a `WebAssembly.Module`
		module = (await import('@jsquash/webp/codec/dec/webp_dec.wasm')).default;
	}
	await init(module);
	ready = true;
}

/**
 * The dark theme screenshot of `component`'s `example` (ex. `AreaChart`, `basic`), or `null` when it has none.  `load` fetches a static file by its path,
 * and `size` picks one of the widths `generate:screenshots` writes.
 */
export async function screenshot(
	component: string,
	example: string,
	load: (path: string) => Promise<Response>,
	size: 400 | 800 = 800
): Promise<Screenshot | null> {
	try {
		const response = await load(`/screenshots/${component}/${example}-dark-${size}w.webp`);
		// Not every example has one (ex. a utility's, or one added since they were last generated)
		if (!response.ok) return null;
		const bytes = new Uint8Array(await response.arrayBuffer());

		await loadDecoder();
		const image = await decode(bytes.buffer);
		const png = await encodePng(image);
		return {
			src: `data:image/png;base64,${base64(png)}`,
			width: image.width,
			height: image.height
		};
	} catch (e) {
		console.error(`og: no screenshot for ${component}/${example}`, e);
		return null;
	}
}

/** RGBA pixels as a PNG, compressed with the platform's own zlib (`CompressionStream`) */
async function encodePng({ width, height, data }: ImageData): Promise<Uint8Array> {
	// Each row starts with its filter type, 0 (none)
	const raw = new Uint8Array((width * 4 + 1) * height);
	for (let y = 0; y < height; y++) {
		raw.set(data.subarray(y * width * 4, (y + 1) * width * 4), y * (width * 4 + 1) + 1);
	}
	const compressed = new Uint8Array(
		await new Response(
			new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate'))
		).arrayBuffer()
	);

	const header = new Uint8Array(13);
	const view = new DataView(header.buffer);
	view.setUint32(0, width);
	view.setUint32(4, height);
	header.set([8, 6, 0, 0, 0], 8); // 8 bits, RGBA, deflate, no filter, no interlace

	const chunks = [
		chunk('IHDR', header),
		chunk('IDAT', compressed),
		chunk('IEND', new Uint8Array())
	];
	const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
	const png = new Uint8Array(8 + chunks.reduce((sum, c) => sum + c.length, 0));
	png.set(signature);
	let offset = 8;
	for (const c of chunks) {
		png.set(c, offset);
		offset += c.length;
	}
	return png;
}

function chunk(type: string, data: Uint8Array) {
	const out = new Uint8Array(12 + data.length);
	const view = new DataView(out.buffer);
	view.setUint32(0, data.length);
	for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
	out.set(data, 8);
	view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
	return out;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
	let c = n;
	for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
	return c >>> 0;
});

function crc32(bytes: Uint8Array) {
	let crc = 0xffffffff;
	for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
	return (crc ^ 0xffffffff) >>> 0;
}
