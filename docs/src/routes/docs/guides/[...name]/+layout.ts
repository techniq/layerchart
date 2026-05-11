import { getMarkdownComponent, loadExamplesFromMarkdown } from '$lib/content.js';

export const load = async ({ params, parent, url }) => {
	const parentData = await parent();

	const { PageComponent, metadata } = await getMarkdownComponent(params.name, 'guides');

	// Load any examples referenced in the markdown content
	const pageExamples = await loadExamplesFromMarkdown(
		metadata.content,
		undefined,
		'guides',
		url.pathname
	);

	const examples = { ...parentData.examples, ...pageExamples };

	return {
		PageComponent,
		metadata,
		examples
	};
};
