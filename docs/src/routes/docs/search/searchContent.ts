import {
	allComponents,
	allGuides,
	allUtils,
	type Component,
	type Guide,
	type Util
} from 'content-collections';
import type { SearchEntry } from './types';
import type { ComponentCatalog } from '$lib/../examples/catalog/types';

/**
 * Strip markdown syntax to get plain text for searching
 */
function stripMarkdown(content: string): string {
	return (
		content
			// Remove code blocks
			.replace(/```[\s\S]*?```/g, '')
			// Remove inline code
			.replace(/`[^`]+`/g, '')
			// Remove links but keep text
			.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
			// Remove images
			.replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
			// Remove HTML tags
			.replace(/<[^>]+>/g, '')
			// Remove headings markup
			.replace(/^#{1,6}\s+/gm, '')
			// Remove bold/italic
			.replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
			.replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
			// Remove blockquotes
			.replace(/^>\s+/gm, '')
			// Remove horizontal rules
			.replace(/^[-*_]{3,}\s*$/gm, '')
			// Remove list markers
			.replace(/^[\s]*[-*+]\s+/gm, '')
			.replace(/^[\s]*\d+\.\s+/gm, '')
			// Remove MDX/directives like :example{...} or ::directive
			.replace(/:{1,2}\w+(\{[^}]*\})?/g, '')
			// Collapse multiple whitespace/newlines
			.replace(/\s+/g, ' ')
			.trim()
	);
}

function componentToEntry(doc: Component): SearchEntry {
	const description = doc.description ?? '';
	const markdownContent = stripMarkdown(doc.content);

	return {
		title: doc.name,
		slug: `docs/components/${doc.slug}`,
		content: description ? `${description} ${markdownContent}` : markdownContent,
		type: 'component',
		category: doc.category
	};
}

function guideToEntry(doc: Guide): SearchEntry {
	const description = doc.description ?? '';
	const markdownContent = stripMarkdown(doc.content);

	return {
		title: doc.name,
		slug: `docs/guides/${doc.slug}`,
		content: description ? `${description} ${markdownContent}` : markdownContent,
		type: 'guide'
	};
}

function utilToEntry(doc: Util): SearchEntry {
	const description = doc.description ?? '';
	const markdownContent = stripMarkdown(doc.content);

	return {
		title: doc.name,
		slug: `docs/utils/${doc.slug}`,
		content: description ? `${description} ${markdownContent}` : markdownContent,
		type: 'util'
	};
}

// Load all catalog JSON files
const catalogModules = import.meta.glob<ComponentCatalog>(
	'/src/examples/catalog/*.json',
	{ eager: true, import: 'default' }
);

// Convert catalog entries to search entries
function catalogToEntries(): SearchEntry[] {
	const entries: SearchEntry[] = [];

	for (const [, catalog] of Object.entries(catalogModules)) {
		for (const example of catalog.examples) {
			entries.push({
				title: `${catalog.component}: ${example.name}`,
				slug: example.path.slice(1), // Remove leading slash
				content: `${catalog.component} example`,
				type: 'example',
				component: catalog.component,
				example: example.name
			});
		}
	}

	return entries;
}

export const searchContent: SearchEntry[] = [
	...allComponents.map(componentToEntry),
	...catalogToEntries(),
	...allGuides.map(guideToEntry),
	...allUtils.map(utilToEntry)
];
