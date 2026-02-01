import { loadExample } from '$lib/examples.js';

export async function load({ params }) {
	// Eagerly load the specific example for this page
	const example = await loadExample(params.name, params.example);

	return {
		example
	};
}
