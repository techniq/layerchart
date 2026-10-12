import { init, parse } from 'es-module-lexer';
import { resolve, type Namespace } from './registry';

const GLOBAL_KEY = '__layerchartSandboxRegistry';

/** Loaded namespaces by module id, read by the shims through `globalThis`. */
const loaded: Record<string, Namespace> = ((globalThis as any)[GLOBAL_KEY] ??= {});

/** Blob URL per module id — a module's export shape never changes, so build each shim once. */
const shimUrls = new Map<string, string>();

/**
 * Build an ES module that re-exports a loaded namespace.
 *
 * Export names are read off the live namespace object, so this covers reserved
 * words (`default`, `class`) and anything else that isn't a bare identifier.
 */
function shimFor(id: string): string {
	const cached = shimUrls.get(id);
	if (cached) return cached;

	const names = Object.keys(loaded[id]);
	const lines = [`const m = globalThis[${JSON.stringify(GLOBAL_KEY)}][${JSON.stringify(id)}];`];
	const exports: string[] = [];
	names.forEach((name, i) => {
		lines.push(`const _${i} = m[${JSON.stringify(name)}];`);
		exports.push(`_${i} as ${JSON.stringify(name)}`);
	});
	lines.push(exports.length ? `export { ${exports.join(', ')} };` : 'export {};');

	const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/javascript' }));
	shimUrls.set(id, url);
	return url;
}

/**
 * Imports with a known specifier: static `import`/`export … from` (`d === -1`) and
 * `import('literal')`. `import.meta` (`d === -2`) and computed `import(expr)` (no `n`)
 * are left alone.
 */
async function moduleImports(js: string) {
	await init;
	const [imports] = parse(js);
	return imports.filter((entry) => entry.n && entry.d !== -2);
}

/** Every module specifier compiled output imports, without duplicates. */
export async function importSpecifiers(js: string) {
	return [...new Set((await moduleImports(js)).map((entry) => entry.n!))];
}

/**
 * The names a static import asks of its module, or `null` when it can't tell. A
 * namespace import (`import * as $ from …`) asks for whatever is read off the namespace,
 * which is how compiled output uses the Svelte runtime.
 */
function requestedNames(js: string, statement: string): string[] | null {
	const namespace = statement.match(/^import\s*\*\s*as\s+([\w$]+)/);
	if (namespace) {
		const alias = namespace[1].replace(/\$/g, '\\$');
		const members = js.matchAll(new RegExp(`(?<![\\w$.])${alias}\\.([A-Za-z_$][\\w$]*)`, 'g'));
		return [...new Set(Array.from(members, (match) => match[1]))];
	}
	const clause = statement.match(/^import\s*([\w$]+)?\s*,?\s*(?:\{([^}]*)\})?\s*from\b/);
	if (!clause) return null;
	const names = clause[1] ? ['default'] : [];
	for (const part of (clause[2] ?? '').split(',')) {
		const name = part.trim().split(/\s+as\s+/)[0];
		if (name) names.push(name.replace(/^['"]|['"]$/g, ''));
	}
	return names;
}

export type LinkResult =
	| { ok: true; url: string }
	| {
			ok: false;
			unresolved: string[];
			failed: { specifier: string; message: string }[];
			/** Names the sandbox's copy of a module doesn't offer (see `registry-plugin.ts`). */
			missing: { specifier: string; names: string[] }[];
	  };

/**
 * Load every module the compiled output imports, rewrite its specifiers to shims, and
 * return a blob URL for the result. `base` is the example's directory, for relative imports.
 */
export async function link(js: string, base?: string): Promise<LinkResult> {
	const imports = await moduleImports(js);
	const unresolved: string[] = [];
	const failed: { specifier: string; message: string }[] = [];
	const ids = new Map<string, string>();

	await Promise.all(
		[...new Set(imports.map((entry) => entry.n!))].map(async (specifier) => {
			const module = resolve(specifier, base);
			if (!module) {
				unresolved.push(specifier);
				return;
			}
			try {
				loaded[module.id] ??= await module.load();
				ids.set(specifier, module.id);
			} catch (err) {
				failed.push({ specifier, message: err instanceof Error ? err.message : String(err) });
			}
		})
	);

	// Modules are offered with only the names the examples use, so check before the
	// browser fails on a blob URL it can't name.
	const missing: { specifier: string; names: string[] }[] = [];
	for (const entry of imports) {
		const id = ids.get(entry.n!);
		if (!id || entry.d !== -1) continue;
		const names = requestedNames(js, js.slice(entry.ss, entry.se));
		const absent = names?.filter((name) => !(name in loaded[id])) ?? [];
		if (absent.length) missing.push({ specifier: entry.n!, names: absent });
	}

	if (unresolved.length || failed.length || missing.length) {
		return { ok: false, unresolved, failed, missing };
	}

	// Splice from the end so earlier positions stay valid.
	let rewritten = js;
	for (const entry of imports.toReversed()) {
		const url = shimFor(ids.get(entry.n!)!);
		// A static import's range is the bare specifier; a dynamic one's includes the quotes.
		const replacement = entry.d === -1 ? url : JSON.stringify(url);
		rewritten = rewritten.slice(0, entry.s) + replacement + rewritten.slice(entry.e);
	}

	return {
		ok: true,
		url: URL.createObjectURL(new Blob([rewritten], { type: 'text/javascript' }))
	};
}
