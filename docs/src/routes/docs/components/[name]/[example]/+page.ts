import { loadExample } from '$lib/examples.js';

export async function load({ params }) {
	// Eagerly load the specific example for this page
	const example = await loadExample(params.name, params.example);

	return {
		example,
		// Override parent's metadata to hide the table of contents on example pages
		metadata: {
			toc: []
		}
	};
}
