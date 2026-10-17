/**
 * Modules the sandbox exposes to user code.
 *
 * These are the *same* instances the docs app itself is built with, so an edited
 * example runs against the workspace build of `layerchart` (not a published copy
 * fetched from a CDN) and shares a single Svelte runtime with the host page.
 *
 * Every entry is a loader, so an edit only fetches what that example imports. They come
 * from `virtual:sandbox-registry` (see `registry-plugin.ts`), generated from the
 * examples' own imports: packages, `$lib` modules and sibling files, each offering only
 * the names the examples use, so the sandbox doesn't make docs pages load more.
 * `registry.test.ts` checks every example's imports resolve here.
 */
import generated from 'virtual:sandbox-registry';

export type Namespace = Record<string, unknown>;
type Loader = () => Promise<Namespace>;

/** Side-effect-only imports in compiled output — the host runtime has already run them. */
const empty: Loader = async () => ({});

const modules: Record<string, Loader> = {
	...generated,
	// Side-effect-only modules compiled components import. `svelte/internal/client` itself
	// is generated, with only the functions compiled examples call.
	'svelte/internal/disclose-version': empty,
	'svelte/internal/flags/async': empty,
	'svelte/internal/flags/legacy': empty
};

/**
 * Finds the module for an import specifier. `base` is the example's directory
 * (`/src/examples/components/GeoPath/`), which turns a relative import into the path the
 * registry keys it by. `id` is stable across examples, so callers can cache per module.
 */
export function resolve(specifier: string, base?: string) {
	const id =
		base && /^\.\.?\//.test(specifier) ? new URL(specifier, `file://${base}`).pathname : specifier;
	return Object.hasOwn(modules, id) ? { id, load: modules[id] } : undefined;
}
