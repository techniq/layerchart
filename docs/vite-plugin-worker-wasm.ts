import { readFileSync } from 'node:fs';
import { basename, dirname, relative } from 'node:path';
import type { Plugin } from 'vite';

const PLACEHOLDER = '__worker_wasm__/';

/**
 * Lets the server build import WebAssembly the way a Worker must: as a module, which wrangler turns
 * into a `WebAssembly.Module` (a Worker refuses to compile WebAssembly from bytes at runtime).
 *
 * Vite refuses a `.wasm` import outright, so in the build each one (ex. `@cf-wasm/resvg/workerd`'s
 * `./lib/resvg.wasm`) is copied into the output under `wasm/` and imported from there by a relative
 * path, while `packages` - the ones that import it - are bundled like everything else.  The build
 * then needs nothing from `node_modules` when wrangler bundles it, which the preview deploy relies
 * on: it uploads the build artifact without installing anything.
 *
 * Under `vite dev`, `packages` stay external instead, for Node to load as they are: Vite's dev
 * server cannot run them (they `require` in places), and Node has no use for the Worker builds.
 */
export function workerWasm({ packages }: { packages: string[] }): Plugin {
	const emitted = new Set<string>();
	let build = false;

	return {
		name: 'worker-wasm',
		enforce: 'pre',

		config: (_, { command }) => (command === 'serve' ? { ssr: { external: packages } } : undefined),

		configResolved(config) {
			build = config.command === 'build';
		},

		async resolveId(source, importer) {
			if (!build || this.environment.name !== 'ssr') return null;
			if (!source.endsWith('.wasm') || !importer) return null;
			const resolved = await this.resolve(source, importer, { skipSelf: true });
			if (!resolved) return null;

			const fileName = `wasm/${basename(resolved.id)}`;
			if (!emitted.has(fileName)) {
				emitted.add(fileName);
				this.emitFile({ type: 'asset', fileName, source: readFileSync(resolved.id) });
			}
			// Where it lands relative to each chunk is only known once chunks are written (below)
			return { id: `${PLACEHOLDER}${fileName}`, external: true };
		},

		renderChunk(code, chunk) {
			if (!code.includes(PLACEHOLDER)) return null;
			return code.replaceAll(
				new RegExp(`${PLACEHOLDER}(wasm/[\\w.-]+\\.wasm)`, 'g'),
				(_, file: string) => {
					const path = relative(dirname(chunk.fileName), file);
					return path.startsWith('.') ? path : `./${path}`;
				}
			);
		}
	};
}
