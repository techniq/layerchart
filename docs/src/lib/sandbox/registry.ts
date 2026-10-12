/**
 * Modules the sandbox exposes to user code.
 *
 * These are the *same* instances the docs app itself is built with, so an edited
 * example runs against the workspace build of `layerchart` (not a published copy
 * fetched from a CDN) and shares a single Svelte runtime with the host page.
 *
 * Every entry is a loader, so an edit only fetches what that example imports. Packages
 * come from `virtual:sandbox-registry` (see `registry-plugin.ts`), which offers only the
 * names the examples use, so the sandbox doesn't make docs pages load more.
 * `registry.test.ts` checks every example's imports resolve here.
 */
import generated from 'virtual:sandbox-registry';

export type Namespace = Record<string, unknown>;
type Loader = () => Promise<Namespace>;

/** Side-effect-only imports in compiled output — the host runtime has already run them. */
const empty: Loader = async () => ({});

const packages: Record<string, Loader> = {
	...generated,
	// Side-effect-only modules compiled components import. `svelte/internal/client` itself
	// is generated, with only the functions compiled examples call.
	'svelte/internal/disclose-version': empty,
	'svelte/internal/flags/async': empty,
	'svelte/internal/flags/legacy': empty
};

/** The `$lib` modules examples import: data loaders, controls and small helpers. */
const lib = import.meta.glob<Namespace>([
	'/src/lib/{data,geo,graph}.remote.ts',
	'/src/lib/utils/*.ts',
	'!/src/lib/utils/*.test.ts',
	'/src/lib/actions/*.ts',
	'/src/lib/attachments/*.ts',
	'/src/lib/components/controls/**/*.svelte'
]);

/** Helper modules that sit next to an example and are imported relatively. */
const exampleModules = import.meta.glob<Namespace>('/src/examples/components/**/*.{js,ts}');

/** Imports are written with `.js`, with no extension, or with the real one. */
function fromFiles(files: Record<string, Loader>, path: string) {
	const candidates = [path, path.replace(/\.js$/, '.ts'), `${path}.ts`, `${path}.js`];
	const id = candidates.find((candidate) => candidate in files);
	return id ? { id, load: files[id] } : undefined;
}

/**
 * Finds the module for an import specifier. `base` is the example's directory
 * (`/src/examples/components/GeoPath/`), needed only for relative imports. `id` is
 * stable across examples, so callers can cache per module rather than per spelling.
 */
export function resolve(specifier: string, base?: string) {
	if (Object.hasOwn(packages, specifier)) return { id: specifier, load: packages[specifier] };
	if (specifier.startsWith('$lib/')) return fromFiles(lib, `/src/lib/${specifier.slice(5)}`);
	if (base && /^\.\.?\//.test(specifier)) {
		return fromFiles(exampleModules, new URL(specifier, `file://${base}`).pathname);
	}
	return undefined;
}
