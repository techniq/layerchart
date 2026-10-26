import { describe, expect, it } from 'vitest';
import { compile } from 'svelte/compiler';
import { exposeData } from '$lib/utils/exampleSource';
import { compileOptions } from './compile-options';
import { importSpecifiers } from './link';
import { resolve } from './registry';

const examples = import.meta.glob<string>('/src/examples/components/**/*.svelte', {
	query: '?raw',
	import: 'default',
	eager: true
});

describe('sandbox registry', () => {
	it('resolves every import of every example', async () => {
		const unresolved: string[] = [];

		for (const [path, source] of Object.entries(examples)) {
			// Compiled exactly as the sandbox does, so type-only imports (erased) and the
			// runtime's own `svelte/internal/*` imports are checked as the browser sees them.
			const { js } = compile(exposeData(source), compileOptions);
			const base = path.slice(0, path.lastIndexOf('/') + 1);
			for (const specifier of await importSpecifiers(js.code)) {
				if (!resolve(specifier, base)) unresolved.push(`${path}: ${specifier}`);
			}
		}

		// Add the module to `registry.ts` — otherwise editing these examples fails.
		expect(unresolved).toEqual([]);
	});
});

describe('importSpecifiers', () => {
	it('finds imports that span several lines', async () => {
		// Compiled output keeps the source's formatting, so long import lists wrap.
		const js =
			"import * as $ from 'svelte/internal/client';\nimport {\n\tArea,\n\tChart\n} from 'layerchart';\n";
		expect(await importSpecifiers(js)).toEqual(['svelte/internal/client', 'layerchart']);
	});
});
