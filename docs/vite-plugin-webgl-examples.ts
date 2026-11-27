import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

/**
 * LayerChart's examples drawn with WebGL, for the layer toggle's `WebGL`.
 *
 * An example in `include` can be when it draws in a `<Layer>` with no `type` (so in the chart's
 * `settings.layer`) and every component it imports from `layerchart` (or `layerchart/geo`, `layerchart/graph`) is
 * one `@layerchart/webgl` exports too.  Its WebGL version (`<example>.svelte?webgl`) imports those
 * from `@layerchart/webgl` instead, whose `Layer` draws a `<WebGL>` scene for `settings.layer`
 * `webgl`, and whose marks draw their WebGL versions in it.
 *
 * `virtual:webgl-examples` lists them, as `<component>/<name>` (ex. `Points/basic`) to a loader
 * of the version's component and source, and `nativeWebGLExamples` those written with
 * `@layerchart/webgl` (ex. `Points/galaxy`), which draw with WebGL whatever the layer toggle.
 */
export function webglExamples({
	examplesDir = 'src/examples/components',
	webglIndex = '../packages/webgl/src/lib/index.ts',
	include
}: {
	examplesDir?: string;
	webglIndex?: string;
	/**
	 * The examples checked to draw the same with WebGL (`<component>/<name>`).  Many that qualify
	 * by their imports don't yet: `@layerchart/webgl`'s marks lack some of core's options.  Every
	 * one that qualifies without it (to check them).
	 */
	include?: string[];
}): Plugin {
	const VIRTUAL = 'virtual:webgl-examples';
	const RESOLVED = '\0' + VIRTUAL;
	let root = process.cwd();
	let webglNames = new Set<string>();

	return {
		name: 'webgl-examples',
		enforce: 'pre',
		configResolved(config) {
			root = config.root;
			webglNames = webglExports(fs.readFileSync(path.resolve(root, webglIndex), 'utf-8'));
		},
		resolveId(id) {
			if (id === VIRTUAL) return RESOLVED;
		},
		load(id) {
			if (id === RESOLVED) {
				const dir = path.resolve(root, examplesDir);
				const entries: string[] = [];
				const native: string[] = [];
				for (const component of fs.readdirSync(dir).sort()) {
					const componentDir = path.join(dir, component);
					if (!fs.statSync(componentDir).isDirectory()) continue;
					for (const file of fs.readdirSync(componentDir).sort()) {
						if (!file.endsWith('.svelte')) continue;
						const key = `${component}/${file.slice(0, -'.svelte'.length)}`;
						const source = fs.readFileSync(path.join(componentDir, file), 'utf-8');
						if (isNativeWebGL(source)) {
							native.push(key);
							continue;
						}
						if (include && !include.includes(key)) continue;
						if (!toWebGL(source, webglNames)) continue;
						const url = `/${examplesDir}/${component}/${file}`;
						entries.push(
							`${JSON.stringify(key)}: () => Promise.all([import(${JSON.stringify(`${url}?webgl`)}), import(${JSON.stringify(`${url}?webgl&raw`)})]).then(([module, raw]) => ({ component: module.default, source: raw.default }))`
						);
					}
				}
				return (
					`export const webglExamples = {\n${entries.join(',\n')}\n};\n` +
					`export const nativeWebGLExamples = new Set(${JSON.stringify(native)});\n`
				);
			}

			const [file, query] = id.split('?');
			if (!query || !file.endsWith('.svelte')) return;
			const params = new URLSearchParams(query);
			if (!params.has('webgl')) return;
			this.addWatchFile(file);
			const source = toWebGL(fs.readFileSync(file, 'utf-8'), webglNames);
			if (source == null) throw new Error(`${file} has no WebGL version`);
			return params.has('raw') ? `export default ${JSON.stringify(source)};` : source;
		},
		// Whether an example qualifies can change with its source (or a new one)
		configureServer(server) {
			server.watcher.on('all', (_event, file) => {
				if (!file.includes(examplesDir)) return;
				for (const environment of Object.values(server.environments)) {
					const module = environment.moduleGraph.getModuleById(RESOLVED);
					if (module) environment.moduleGraph.invalidateModule(module);
				}
			});
		}
	};
}

/** The values `@layerchart/webgl` exports (its own, and those it re-exports from `layerchart`) */
function webglExports(index: string) {
	const names = new Set<string>();
	for (const [, list] of index.matchAll(/^export \{([^}]*)\}/gm)) {
		for (const specifier of list.split(',')) {
			const name = specifier
				.trim()
				.split(/\s+as\s+/)
				.pop();
			if (name) names.add(name);
		}
	}
	return names;
}

/** Written with `@layerchart/webgl` (ex. a 3D chart in a `<WebGL>` layer) */
export function isNativeWebGL(source: string) {
	return /from '@layerchart\/webgl(\/webgl)?'/.test(source);
}

const IMPORT =
	/^([ \t]*)import \{([^}]*)\} from '(layerchart|layerchart\/geo|layerchart\/graph|layerchart\/hierarchy|layerchart\/force)';?$/gm;

/** Layers, which draw in their own way whatever the toggle (ex. an `Html` layer of labels) */
const LAYERS = new Set(['Svg', 'Canvas', 'Html']);

/**
 * An example's source with its components imported from `@layerchart/webgl`, or `null` if it
 * can't draw with WebGL
 */
export function toWebGL(source: string, webglNames: Set<string>): string | null {
	// Something drawn in the chart's layer (`settings.layer`): a `<Layer>` with no `type`, a
	// simplified chart, or a `Chart` drawing its `marks` in its own.  Layers of a given type (ex.
	// `<Layer type="html">` labels) draw as they do whatever the toggle, so they're kept.
	const simplified = /<(ArcChart|AreaChart|BarChart|LineChart|PieChart|ScatterChart)[\s>/]/.test(
		source
	);
	const layers = [...source.matchAll(/<Layer\b([^>]*)>/g)].map((m) => m[1]);
	const untyped = layers.some((attrs) => !/\btype\s*=|\{type\}/.test(attrs));
	// A type decided as it runs (ex. `type={layer}`) can't be told apart
	if (layers.some((attrs) => /\btype=\{|\{type\}/.test(attrs))) return null;
	const explicit = /<(Svg|Canvas|Html)[\s>]/.test(source);
	const chartOnly = /<Chart[\s>]/.test(source) && !layers.length && !explicit;
	if (/<WebGL[\s>]/.test(source)) return null;
	if (!simplified && !untyped && !chartOnly) return null;
	// Per-layer imports draw in their layer only
	if (/from 'layerchart\/(svg|canvas|html)'/.test(source)) return null;
	// Its own components could draw LayerChart's marks, which a WebGL scene doesn't
	if (/from '\.{1,2}\/[^']*\.svelte'/.test(source)) return null;

	let qualifies = true;
	const rewritten = source.replace(IMPORT, (_whole, indent: string, list: string, from: string) => {
		const kept: string[] = [];
		const moved: string[] = [];
		for (const raw of list.split(',')) {
			const specifier = raw.trim();
			if (!specifier) continue;
			const name = specifier.replace(/^type\s+/, '').split(/\s+as\s+/)[0];
			const isType = specifier.startsWith('type ');
			if (!isType && webglNames.has(name)) {
				moved.push(specifier);
			} else {
				// A component `@layerchart/webgl` doesn't have would draw nothing in its scene (other
				// names, ex. `ChartState` as a type, are fine)
				const alias = specifier.split(/\s+as\s+/).pop()!;
				if (
					!isType &&
					!LAYERS.has(name) &&
					/^[A-Z]/.test(name) &&
					new RegExp(`<${alias}[\\s.>/]`).test(source)
				)
					qualifies = false;
				kept.push(specifier);
			}
		}
		return [
			moved.length ? `${indent}import { ${moved.join(', ')} } from '@layerchart/webgl';` : null,
			kept.length ? `${indent}import { ${kept.join(', ')} } from '${from}';` : null
		]
			.filter(Boolean)
			.join('\n');
	});
	return qualifies && rewritten !== source ? rewritten : null;
}
