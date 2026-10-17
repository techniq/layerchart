import { existsSync, globSync, readFileSync } from 'node:fs';
import { dirname, join, posix, relative, resolve } from 'node:path';
import { compile, parse } from 'svelte/compiler';
import type { Plugin } from 'vite';
import { exposeData } from '../utils/exampleSource';
import { compileOptions } from './compile-options';

/**
 * Generates `virtual:sandbox-registry`: everything edited examples may import, as loaders
 * — packages, `$lib` modules, and the helper files that sit next to an example.
 *
 * Each module is offered with only the names some example imports, through a small
 * re-export module, not as its whole namespace. Exposing a whole namespace (`import('layerchart')`)
 * stops the bundler dropping unused exports, and the extra code lands in chunks every docs
 * page loads. Names an example already imports are already in the build, so offering
 * them costs pages nothing.
 *
 * The Svelte runtime is treated the same way. Compiled components import all of
 * `svelte/internal/client`, so every example is compiled here to learn which of its
 * functions they call.
 *
 * An edit can use any name, or any template feature, some example uses. `link.ts`
 * reports anything else by name rather than letting the browser fail on it.
 */

const REGISTRY_ID = 'virtual:sandbox-registry';
const EXPORTS_PREFIX = 'virtual:sandbox-exports/';

/**
 * The key in a virtual id, in base64url. Written plainly, `$lib/…/Controls.svelte` or
 * `$lib/geo.remote.js` would end the id with that extension, and the Svelte and SvelteKit
 * plugins would pick the re-export module up as a component or a remote-functions file.
 */
const toId = (key: string) => EXPORTS_PREFIX + Buffer.from(key).toString('base64url');
const fromId = (id: string) =>
	Buffer.from(id.slice(EXPORTS_PREFIX.length + 1), 'base64url').toString();
const RUNTIME = 'svelte/internal/client';

/**
 * Compiled output's own runtime imports: `svelte/internal/client` is gathered from compiled
 * examples below, and its side-effect-only siblings are listed by hand in `registry.ts`.
 */
const isRuntime = (specifier: string) =>
	specifier === 'svelte/internal' || specifier.startsWith('svelte/internal/');

/** `target` is what the generated loader imports; it differs from the key for sibling files. */
type Usage = { names: Set<string>; whole: boolean; target: string };

type Example = { dir: string; source: string };

/** Compiled output imports the runtime as `import * as $ from 'svelte/internal/client'`. */
const RUNTIME_MEMBER = /(?<![\w$.])\$\.([A-Za-z_$][\w$]*)/g;

/** `dir` is the example's folder as the app sees it (`/src/examples/components/GeoPath/`). */
function readExamples(root: string, examplesDir: string): Example[] {
	return globSync('**/*.svelte', { cwd: examplesDir }).map((path) => {
		const file = join(examplesDir, path);
		const dir = '/' + relative(root, dirname(file)).split('\\').join('/') + '/';
		return { dir, source: readFileSync(file, 'utf8') };
	});
}

/**
 * The registry key and loader target for an import. Packages and `$lib` modules are keyed
 * as written. A relative import is keyed by the path it points to (what `registry.ts`
 * rebuilds from the example's folder), and targets the file that's actually there, since
 * examples write `./timings.js` for a `.ts` file.
 */
function locate(root: string, dir: string, specifier: string) {
	if (!/^\.\.?\//.test(specifier)) return { key: specifier, target: specifier };
	const key = posix.join(dir, specifier);
	const candidates = [key, key.replace(/\.js$/, '.ts'), `${key}.ts`, `${key}.js`];
	const target = candidates.find((candidate) => existsSync(join(root, candidate)));
	return target ? { key, target } : undefined;
}

/** Every import across the examples, with the names each one uses. */
function scanImports(root: string, examples: Example[]) {
	const usage = new Map<string, Usage>();
	const use = (dir: string, specifier: string) => {
		const located = locate(root, dir, specifier);
		if (!located) return; // a missing file fails that example's own build
		let entry = usage.get(located.key);
		if (!entry) {
			entry = { names: new Set(), whole: false, target: located.target };
			usage.set(located.key, entry);
		}
		return entry;
	};

	for (const { dir, source } of examples) {
		let ast;
		try {
			ast = parse(source, { modern: true });
		} catch {
			continue; // a broken example fails its own build; nothing to offer from it
		}

		for (const script of [ast.instance, ast.module]) {
			if (!script) continue;
			for (const node of script.content.body as any[]) {
				if (node.type !== 'ImportDeclaration' || node.importKind === 'type') continue;
				const specifier: string = node.source.value;
				if (isRuntime(specifier)) continue;
				const entry = use(dir, specifier);
				if (!entry) continue;
				for (const spec of node.specifiers) {
					if (spec.importKind === 'type') continue;
					if (spec.type === 'ImportNamespaceSpecifier') entry.whole = true;
					else if (spec.type === 'ImportDefaultSpecifier') entry.names.add('default');
					else entry.names.add(spec.imported.name ?? spec.imported.value);
				}
			}

			// `import('pkg')` hands back the whole namespace.
			const text = source.slice(script.start, script.end);
			for (const match of text.matchAll(/\bimport\(\s*(['"])([^'"]+)\1\s*\)/g)) {
				const entry = isRuntime(match[2]) ? undefined : use(dir, match[2]);
				if (entry) entry.whole = true;
			}
		}
	}
	return usage;
}

/** The runtime functions compiled examples call. Compiles every example, so only on demand. */
function scanRuntime(examples: Example[]) {
	const names = new Set<string>();
	for (const { source } of examples) {
		try {
			// Compiled exactly as the sandbox compiles, so these are the calls it makes.
			const { js } = compile(exposeData(source), compileOptions);
			for (const match of js.code.matchAll(RUNTIME_MEMBER)) names.add(match[1]);
		} catch {
			// a broken example fails its own build
		}
	}
	return names;
}

/** What the editor chunk imports (`lazy.ts`), so Vite doesn't discover it mid-edit. */
const EDITOR_DEPS = [
	'@codemirror/autocomplete',
	'@codemirror/commands',
	'@codemirror/language',
	'@codemirror/lint',
	'@codemirror/state',
	'@codemirror/view',
	'@lezer/highlight',
	'@replit/codemirror-lang-svelte',
	'es-module-lexer',
	'svelte/compiler'
];

export function sandboxRegistry(): Plugin {
	let root = '';
	let examplesDir = '';
	let read: Example[] | null = null;
	let usage: Map<string, Usage> | null = null;
	let runtime: Set<string> | null = null;
	const examples = () => (read ??= readExamples(root, examplesDir));
	const imports = () => (usage ??= scanImports(root, examples()));
	const runtimeNames = () => (runtime ??= scanRuntime(examples()));

	return {
		name: 'layerchart-docs:sandbox-registry',

		config(config, { command }) {
			root = resolve(config.root ?? '');
			examplesDir = join(root, 'src/examples/components');
			if (command !== 'serve') return;
			// Everything here loads lazily on first edit. Undiscovered, each one makes the dev
			// server re-optimize and reload the page in the middle of that edit. Only npm
			// packages can be pre-bundled; the workspace `layerchart` and `svelte` never are.
			const packages = [...imports().keys()].filter(
				(specifier) => !/^(\$|~|\/|svelte(\/|$)|layerchart(\/|$))/.test(specifier)
			);
			return { optimizeDeps: { include: [...EDITOR_DEPS, ...packages] } };
		},

		resolveId(id) {
			if (id === REGISTRY_ID || id.startsWith(EXPORTS_PREFIX)) return '\0' + id;
		},

		async load(id) {
			if (id === '\0' + REGISTRY_ID) {
				const entries: [string, Usage][] = [
					...imports(),
					[RUNTIME, { names: new Set(), whole: false, target: RUNTIME }]
				];
				const lines = entries
					.sort(([a], [b]) => a.localeCompare(b))
					.map(([key, { whole, target }]) => {
						const source = whole ? target : toId(key);
						return `\t${JSON.stringify(key)}: () => import(${JSON.stringify(source)}),`;
					});
				return `export default {\n${lines.join('\n')}\n};\n`;
			}

			if (id.startsWith('\0' + EXPORTS_PREFIX)) {
				const key = fromId(id);
				const entry = imports().get(key);
				let names = [...(entry?.names ?? [])];
				if (key === RUNTIME) {
					// `$.` read off compiled output; drop anything that only looked like a call.
					// @ts-expect-error - no declarations for 'svelte/internal/client'
					const exported = await import('svelte/internal/client'); // eslint-disable-line svelte/no-svelte-internal -- reads what it exports
					names = [...runtimeNames()].filter((name) => name in exported);
				}
				names = names
					.sort()
					.map((name) =>
						/^[\p{ID_Start}$_][\p{ID_Continue}$]*$/u.test(name) ? name : JSON.stringify(name)
					);
				return `export { ${names.join(', ')} } from ${JSON.stringify(entry?.target ?? key)};\n`;
			}
		},

		// An edited, added or removed example can change what's offered.
		hotUpdate({ file }) {
			if (!file.endsWith('.svelte') || relative(examplesDir, file).startsWith('..')) return;
			read = usage = runtime = null;
			for (const id of this.environment.moduleGraph.idToModuleMap.keys()) {
				if (id === '\0' + REGISTRY_ID || id.startsWith('\0' + EXPORTS_PREFIX)) {
					const module = this.environment.moduleGraph.getModuleById(id);
					if (module) this.environment.moduleGraph.invalidateModule(module);
				}
			}
		}
	};
}
