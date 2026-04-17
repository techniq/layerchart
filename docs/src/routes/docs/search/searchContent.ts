import {
	allComponents,
	allGuides,
	allUtils,
	type Component,
	type Guide,
	type Util
} from 'content-collections';
import type { ComponentCatalog } from '$lib/../examples/catalog/types';
import { stripMarkdown } from '$lib/markdown/utils.js';

type TocEntry = { id: string; text: string; level: number };

/**
 * Extract content under each heading from markdown.
 * Returns a map of heading text -> content under that heading.
 */
function extractHeadingContents(markdown: string, toc: TocEntry[]): Map<string, string> {
	const result = new Map<string, string>();

	// Find positions of each heading in the markdown
	const headingPositions: { text: string; start: number; end: number }[] = [];

	for (const heading of toc) {
		// Match the heading line (e.g., "## Heading Text" or "### Heading Text")
		// Account for possible MDC directives in the heading
		const headingPattern = new RegExp(
			`^#{1,6}\\s+${escapeRegexChars(heading.text)}(?:\\s*:[a-zA-Z][\\w-]*\\{[^}]*\\})*\\s*$`,
			'gm'
		);
		const match = headingPattern.exec(markdown);
		if (match) {
			headingPositions.push({
				text: heading.text,
				start: match.index + match[0].length,
				end: markdown.length // Will be updated below
			});
		}
	}

	// Sort by position and set end positions
	headingPositions.sort((a, b) => a.start - b.start);
	for (let i = 0; i < headingPositions.length; i++) {
		if (i < headingPositions.length - 1) {
			// Find where the next heading of same or higher level starts
			const nextHeadingMatch = markdown.slice(headingPositions[i].start).match(/^#{1,6}\s+/m);
			if (nextHeadingMatch) {
				headingPositions[i].end = headingPositions[i].start + (nextHeadingMatch.index ?? 0);
			}
		}
	}

	// Extract and clean content for each heading
	for (const pos of headingPositions) {
		const rawContent = markdown.slice(pos.start, pos.end).trim();
		const cleanContent = stripMarkdown(rawContent).slice(0, 200); // Limit length
		result.set(pos.text, cleanContent);
	}

	return result;
}

function escapeRegexChars(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export type SearchEntry = {
	title: string;
	slug: string;
	content: string;
	type: 'component' | 'example' | 'guide' | 'util' | 'heading' | 'page';
	category?: string;
	/** For examples, the component name (e.g., 'AreaChart') */
	component?: string;
	/** For examples, the example name (e.g., 'basic') */
	example?: string;
	/** For headings, the parent page title */
	parent?: string;
	/** For headings, the parent page slug (without hash) */
	parentSlug?: string;
	/** For headings, the parent entry type (component/guide/util) */
	parentType?: 'component' | 'guide' | 'util';
};

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

function componentHeadingsToEntries(doc: Component): SearchEntry[] {
	// Use a Set to track seen heading IDs and filter duplicates
	const seen = new Set<string>();
	const parentSlug = `docs/components/${doc.slug}`;
	const headingContents = extractHeadingContents(doc.content, doc.toc);

	return doc.toc
		.filter((heading) => {
			if (seen.has(heading.id)) return false;
			seen.add(heading.id);
			return true;
		})
		.map((heading) => ({
			title: heading.text,
			slug: `${parentSlug}#${heading.id}`,
			content: headingContents.get(heading.text) || doc.name,
			type: 'heading' as const,
			category: doc.category,
			parent: doc.name,
			parentSlug,
			parentType: 'component' as const
		}));
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

function guideHeadingsToEntries(doc: Guide): SearchEntry[] {
	const seen = new Set<string>();
	const parentSlug = `docs/guides/${doc.slug}`;
	const headingContents = extractHeadingContents(doc.content, doc.toc);

	return doc.toc
		.filter((heading) => {
			if (seen.has(heading.id)) return false;
			seen.add(heading.id);
			return true;
		})
		.map((heading) => ({
			title: heading.text,
			slug: `${parentSlug}#${heading.id}`,
			content: headingContents.get(heading.text) || doc.name,
			type: 'heading' as const,
			parent: doc.name,
			parentSlug,
			parentType: 'guide' as const
		}));
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

function utilHeadingsToEntries(doc: Util): SearchEntry[] {
	const seen = new Set<string>();
	const parentSlug = `docs/utils/${doc.slug}`;
	const headingContents = extractHeadingContents(doc.content, doc.toc);

	return doc.toc
		.filter((heading) => {
			if (seen.has(heading.id)) return false;
			seen.add(heading.id);
			return true;
		})
		.map((heading) => ({
			title: heading.text,
			slug: `${parentSlug}#${heading.id}`,
			content: headingContents.get(heading.text) || doc.name,
			type: 'heading' as const,
			parent: doc.name,
			parentSlug,
			parentType: 'util' as const
		}));
}

// Load all catalog JSON files
const catalogModules = import.meta.glob<ComponentCatalog>('/src/examples/catalog/*.json', {
	eager: true,
	import: 'default'
});

// Convert catalog entries to search entries
function catalogToEntries(): SearchEntry[] {
	const entries: SearchEntry[] = [];

	for (const [, catalog] of Object.entries(catalogModules)) {
		for (const example of catalog.examples) {
			entries.push({
				title: example.title,
				slug: example.path.slice(1), // Remove leading slash
				content: [catalog.component, example.name.replaceAll('-', ' ')].join(' '),
				type: 'example',
				component: catalog.component,
				example: example.name
			});
		}
	}

	return entries;
}

// Top-level documentation pages
const topLevelPages: SearchEntry[] = [
	{
		title: 'Getting Started',
		slug: 'docs/getting-started',
		content:
			'Install LayerChart and create your first chart. Setup guide for SvelteKit with Tailwind CSS, shadcn-svelte, Skeleton, Svelte UX, daisyUI, and UnoCSS.',
		type: 'page'
	},
	{
		title: 'Examples',
		slug: 'docs/examples',
		content: 'Browse example charts and visualizations',
		type: 'page'
	},
	{
		title: 'Playground',
		slug: 'docs/playground',
		content:
			'Interactive playground to experiment with LayerChart components. Try code examples in StackBlitz.',
		type: 'page'
	},
	{
		title: 'Showcase',
		slug: 'docs/showcase',
		content:
			'Real-world projects and websites built with LayerChart. Community examples and inspiration.',
		type: 'page'
	},
	{
		title: 'Releases',
		slug: 'docs/releases',
		content: 'Release notes and changelog for LayerChart. Version history and updates.',
		type: 'page'
	}
];

export const searchContent: SearchEntry[] = [
	...topLevelPages,
	...allComponents.map(componentToEntry),
	...allComponents.flatMap(componentHeadingsToEntries),
	...catalogToEntries(),
	...allGuides.map(guideToEntry),
	...allGuides.flatMap(guideHeadingsToEntries),
	...allUtils.map(utilToEntry),
	...allUtils.flatMap(utilHeadingsToEntries)
];
