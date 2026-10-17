import type { CompileOptions } from 'svelte/compiler';

/**
 * Matches the docs app's own config — examples use top-level `await` for their data.
 * Shared with `registry-plugin.ts`, which compiles every example the same way to learn
 * which Svelte runtime functions the sandbox has to offer.
 */
export const compileOptions = {
	filename: 'Example.svelte',
	generate: 'client',
	css: 'injected',
	runes: true,
	dev: false,
	experimental: { async: true }
} satisfies CompileOptions;
