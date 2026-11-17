import { loadExample } from '$lib/examples.js';

export async function load({ params, parent }) {
	// Eagerly load the specific example for this page
	const { componentName } = await parent();
	const example = await loadExample(componentName, params.example);

	return {
		example,
		// Override parent's metadata to hide the table of contents on example pages
		metadata: {
			toc: []
		}
	};
}
