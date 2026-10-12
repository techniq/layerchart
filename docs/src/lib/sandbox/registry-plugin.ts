import { globSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { compile, parse } from 'svelte/compiler';
import type { Plugin } from 'vite';
import { exposeData } from '../utils/exampleSource';
import { compileOptions } from './compile-options';

/**
 * Generates `virtual:sandbox-registry`: the packages edited examples may import, as loaders.
 *
 * Each package is offered with only the names some example imports, through a small
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
const RUNTIME = 'svelte/internal/client';

/**
 * Specifiers this plugin doesn't offer: `registry.ts` finds `$lib` and sibling files by
 * glob, and the runtime's side-effect-only modules by hand. The runtime itself is
 * gathered from compiled output below.
 */
const handledElsewhere = (specifier: string) =>
	specifier.startsWith('$lib/') ||
	specifier.startsWith('.') ||
	specifier.startsWith('/') ||
	specifier === 'svelte/internal' ||
	specifier.startsWith('svelte/internal/');

type Usage = { names: Set<string>; whole: boolean };

/** Compiled output imports the runtime as `import * as $ from 'svelte/internal/client'`. */
const RUNTIME_MEMBER = /(?<![\w$.])\$\.([A-Za-z_$][\w$]*)/g;

function readExamples(examplesDir: string) {
	return globSync('**/*.svelte', { cwd: examplesDir }).map((path) =>
		readFileSync(join(examplesDir, path), 'utf8')
	);
}

/** Every package import across the examples, with the names each one uses. */
function scanImports(sources: string[]) {
	const usage = new Map<string, Usage>();
	const use = (specifier: string) => {
		let entry = usage.get(specifier);
		if (!entry) usage.set(specifier, (entry = { names: new Set(), whole: false }));
		return entry;
	};

	for (const source of sources) {
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
				if (handledElsewhere(specifier)) continue;
				const entry = use(specifier);
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
				if (!handledElsewhere(match[2])) use(match[2]).whole = true;
			}
		}
	}
	return usage;
}

/** The runtime functions compiled examples call. Compiles every example, so only on demand. */
function scanRuntime(sources: string[]) {
	const names = new Set<string>();
	for (const source of sources) {
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
	let examplesDir = '';
	let sources: string[] | null = null;
	let usage: Map<string, Usage> | null = null;
	let runtime: Set<string> | null = null;
	const examples = () => (sources ??= readExamples(examplesDir));
	const imports = () => (usage ??= scanImports(examples()));
	const runtimeNames = () => (runtime ??= scanRuntime(examples()));

	return {
		name: 'layerchart-docs:sandbox-registry',

		config(config, { command }) {
			examplesDir = resolve(config.root ?? '', 'src/examples/components');
			if (command !== 'serve') return;
			// Everything here loads lazily on first edit. Undiscovered, each one makes the dev
			// server re-optimize and reload the page in the middle of that edit.
			const packages = [...imports().keys()].filter(
				(specifier) => !/^(\$|~|svelte(\/|$)|layerchart(\/|$))/.test(specifier)
			);
			return { optimizeDeps: { include: [...EDITOR_DEPS, ...packages] } };
		},

		resolveId(id) {
			if (id === REGISTRY_ID || id.startsWith(EXPORTS_PREFIX)) return '\0' + id;
		},

		async load(id) {
			if (id === '\0' + REGISTRY_ID) {
				const entries = [...imports(), [RUNTIME, { names: new Set(), whole: false }] as const];
				const lines = entries
					.sort(([a], [b]) => a.localeCompare(b))
					.map(([specifier, { whole }]) => {
						const target = whole ? specifier : EXPORTS_PREFIX + encodeURIComponent(specifier);
						return `\t${JSON.stringify(specifier)}: () => import(${JSON.stringify(target)}),`;
					});
				return `export default {\n${lines.join('\n')}\n};\n`;
			}

			if (id.startsWith('\0' + EXPORTS_PREFIX)) {
				const specifier = decodeURIComponent(id.slice(EXPORTS_PREFIX.length + 1));
				let names = [...(imports().get(specifier)?.names ?? [])];
				if (specifier === RUNTIME) {
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
				return `export { ${names.join(', ')} } from ${JSON.stringify(specifier)};\n`;
			}
		},

		// An edited, added or removed example can change what's offered.
		hotUpdate({ file }) {
			if (!file.endsWith('.svelte') || relative(examplesDir, file).startsWith('..')) return;
			sources = usage = runtime = null;
			for (const id of this.environment.moduleGraph.idToModuleMap.keys()) {
				if (id === '\0' + REGISTRY_ID || id.startsWith('\0' + EXPORTS_PREFIX)) {
					const module = this.environment.moduleGraph.getModuleById(id);
					if (module) this.environment.moduleGraph.invalidateModule(module);
				}
			}
		}
	};
}
