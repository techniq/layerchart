import { registry } from './registry';

const GLOBAL_KEY = '__layerchartSandboxRegistry';

/** Blob URL per specifier — a module's export shape never changes, so build each shim once. */
const shimUrls = new Map<string, string>();

function ensureGlobal() {
	(globalThis as any)[GLOBAL_KEY] = registry;
}

/**
 * Build an ES module that re-exports a registry entry.
 *
 * Export names are read off the live namespace object, so this covers reserved
 * words (`default`, `class`) and anything else that isn't a bare identifier.
 */
function shimFor(specifier: string): string | undefined {
	const cached = shimUrls.get(specifier);
	if (cached) return cached;

	const ns = registry[specifier];
	if (!ns) return undefined;

	const names = Object.keys(ns);
	const lines = [`const m = globalThis[${JSON.stringify(GLOBAL_KEY)}][${JSON.stringify(specifier)}];`];
	const exports: string[] = [];
	names.forEach((name, i) => {
		lines.push(`const _${i} = m[${JSON.stringify(name)}];`);
		exports.push(`_${i} as ${JSON.stringify(name)}`);
	});
	lines.push(exports.length ? `export { ${exports.join(', ')} };` : 'export {};');

	const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/javascript' }));
	shimUrls.set(specifier, url);
	return url;
}

/**
 * Import statements in compiled Svelte output are machine-generated, one per line, at the top.
 * The `[^'"\n]` classes keep this from running past the statement into unrelated string
 * literals (`export default function …` followed later by `value: 'integer'`).
 *
 * A production version should lex with `es-module-lexer` rather than pattern-match.
 */
const IMPORT_RE = /^(\s*(?:import|export)\b(?:[^'"\n]*?\bfrom)?\s*)(['"])([^'"\n]+)\2/gm;

export type LinkResult = { ok: true; url: string } | { ok: false; unresolved: string[] };

/** Rewrite bare specifiers to registry shims and return a blob URL for the module. */
export function link(js: string): LinkResult {
	ensureGlobal();
	const unresolved: string[] = [];

	const rewritten = js.replace(IMPORT_RE, (match, prefix, quote, specifier) => {
		if (specifier.startsWith('.') || specifier.startsWith('/') || specifier.startsWith('blob:')) {
			return match;
		}
		const url = shimFor(specifier);
		if (!url) {
			unresolved.push(specifier);
			return match;
		}
		return prefix + quote + url + quote;
	});

	if (unresolved.length) {
		return { ok: false, unresolved };
	}

	return {
		ok: true,
		url: URL.createObjectURL(new Blob([rewritten], { type: 'text/javascript' }))
	};
}

export function availableModules() {
	return Object.keys(registry).filter((k) => !k.startsWith('svelte/internal'));
}
