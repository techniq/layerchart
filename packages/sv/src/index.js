import { transforms } from '@sveltejs/sv-utils';
import { defineAddon, defineAddonOptions } from 'sv';

const GITHUB_RAW_BASE =
	'https://raw.githubusercontent.com/techniq/layerchart/next/docs/src/examples';

const options = defineAddonOptions()
	.add('demo', {
		question: 'Which demo? (e.g. components/ArcChart/gradient-with-text)',
		type: 'string',
		default: 'components/ArcChart/gradient-with-text'
	})
	.build();

/**
 * Parse import statements from svelte/ts source code.
 * Returns a map of package name -> set of imported identifiers.
 */
function parseImports(/** @type {string} */ source) {
	/** @type {Map<string, Set<string>>} */
	const imports = new Map();

	// Match: import { X, Y } from 'package'
	// Match: import X from 'package'
	const importRegex = /import\s+(?:\{([^}]+)\}|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
	let match;
	while ((match = importRegex.exec(source)) !== null) {
		const pkg = match[3];
		// Skip relative/alias imports
		if (pkg.startsWith('.') || pkg.startsWith('$')) continue;

		if (!imports.has(pkg)) {
			imports.set(pkg, new Set());
		}
		/** @type {Set<string>} */
		const names = /** @type {Set<string>} */ (imports.get(pkg));
		if (match[1]) {
			// Named imports
			match[1].split(',').forEach((n) => names.add(n.trim()));
		} else if (match[2]) {
			// Default import
			names.add(match[2]);
		}
	}

	return imports;
}

/**
 * Fetch a demo example from the layerchart GitHub repo.
 * @param {string} demo - Path like "components/ArcChart/gradient-with-text"
 * @returns {Promise<string>} The source code
 */
async function fetchDemo(demo) {
	const url = `${GITHUB_RAW_BASE}/${demo}.svelte`;
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Failed to fetch demo "${demo}" from ${url} (${res.status})`);
	}
	return res.text();
}

export default defineAddon({
	id: '@layerchart/sv',
	options,

	setup: ({ isKit, unsupported }) => {
		if (!isKit) unsupported('Requires SvelteKit');
	},

	run: async ({ directory, sv, options }) => {
		const demo = options.demo;

		// Fetch the demo source
		const source = await fetchDemo(demo);

		// Parse imports to determine dependencies
		const imports = parseImports(source);

		// Install detected packages (examples are from layerchart v2/next)
		for (const [pkg] of imports) {
			sv.dependency(pkg, pkg === 'layerchart' ? 'next' : 'latest');
		}

		// Always ensure layerchart is installed
		if (!imports.has('layerchart')) {
			sv.dependency('layerchart', 'next');
		}

		// Extract the demo name for the file path
		// e.g. "components/ArcChart/gradient-with-text" -> "ArcChart/gradient-with-text"
		const parts = demo.split('/');
		const demoName = parts.slice(1).join('/');

		// Write the demo component
		sv.file(
			`${directory.lib}/layerchart/demos/${demoName}.svelte`,
			transforms.text(() => source)
		);

		// Add a route that renders the demo
		sv.file(
			directory.kitRoutes + '/+page.svelte',
			transforms.svelteScript({ language: 'ts' }, ({ ast, svelte, js }) => {
				js.imports.addDefault(ast.instance.content, {
					as: 'Demo',
					from: `$lib/layerchart/demos/${demoName}.svelte`
				});

				svelte.addFragment(ast, '<Demo />');
			})
		);
	}
});
