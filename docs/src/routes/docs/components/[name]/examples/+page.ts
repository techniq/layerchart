import { loadExamples } from '$lib/examples.js';

export async function load({ parent }) {
	const { catalog } = await parent();

	// Load all examples from the catalog for this component
	let examples = {};

	if (catalog?.examples && catalog.component) {
		const items = catalog.examples.map((ex: { name: string }) => ({
			component: catalog.component,
			name: ex.name
		}));
		examples = await loadExamples(items);
	}

	return {
		examples
	};
}
