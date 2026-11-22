import { loadExample } from '$lib/examples.js';

export async function load({ params, parent }) {
	// Eagerly load the specific example for this page
	const { componentName, metadata } = await parent();
	const example = await loadExample(componentName, params.example);

	// As the component layout titles examples: in sentence case (ex. `Axis labels inside`)
	const title = example?.module?.title ?? sentence(params.example);

	return {
		example,
		// Replaces the component's, which hides the table of contents on example pages, while still
		// naming the page for its tab and link previews, as a breadcrumb (ex. `AreaChart › Basic`)
		metadata: {
			name: `${metadata.name ?? componentName} › ${title}`,
			description: metadata.description,
			toc: []
		}
	};
}

function sentence(slug: string) {
	const words = slug.replaceAll('-', ' ');
	return words[0].toUpperCase() + words.slice(1);
}
