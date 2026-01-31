import type { Component } from 'svelte';
import { error } from '@sveltejs/kit';

import {
	allComponents,
	type Component as ComponentMetadata,
	type Example as ExampleMetadata,
	allUtils,
	type Util as UtilMetadata,
	allGuides,
	type Guide as GuideMetadata
} from 'content-collections';

import type { Examples } from '$lib/types.js';
import { loadExample, loadExampleByPath } from '$lib/examples.js';

/**
 * Get markdown document component and metadata (frontmatter)
 * @param slug
 * @param type - The type of content ('components' or 'utils')
 * @returns
 */
export async function getMarkdownComponent(
	slug: string = 'index',
	type: 'components' | 'utils' | 'guides' = 'components'
) {
	const modules = import.meta.glob<{
		default: Component;
		metadata: ComponentMetadata | ExampleMetadata | UtilMetadata | GuideMetadata;
	}>('/src/content/**/*.md');

	let doc: Awaited<ReturnType<(typeof modules)[string]>> | null = null;
	for (const [path, resolver] of Object.entries(modules)) {
		if (path === `/src/content/${type}/${slug}.md`) {
			doc = await resolver();
			break;
		}
	}

	const metadata = getMetadata(slug, type);

	if (!doc || !metadata) {
		error(404, 'Could not find the document.');
	}

	return {
		PageComponent: doc.default,
		metadata
	};
}

/**
 * Get full metadata (authored frontmatter + content-collection transformed)
 */
function getMetadata(
	slug: string,
	type: 'components' | 'utils' | 'guides' = 'components'
): ComponentMetadata | UtilMetadata | GuideMetadata {
	if (type === 'guides') {
		return allGuides.find((g) => g.slug === slug) as any;
	}
	if (type === 'utils') {
		return allUtils.find((u) => u.slug === slug) as any;
	}
	return allComponents.find((c) => c.slug === slug) as any;
}

/**
 * Resolve a relative or absolute path to a full path from /src
 * @param path - The path from the example (e.g., "./color-schemes.svelte" or "/routes/docs/guides/styles/color-schemes.svelte")
 * @param currentPath - The current page URL pathname (e.g., "/docs/guides/styles")
 * @returns The resolved path (e.g., "/src/routes/docs/guides/styles/color-schemes.svelte")
 */
export function resolveExamplePath(path: string, currentPath: string, type?: string): string {
	if (type === 'guides' && (path.startsWith('./') || !path.startsWith('/'))) {
		// For guides, resolve relative to src/content/guides/
		const relativePath = path.startsWith('./') ? path.slice(2) : path;
		return `/src/content/guides/${relativePath}`;
	}
	if (path.startsWith('./')) {
		return `/src/routes${currentPath}/${path.slice(2)}`;
	} else if (path.startsWith('/')) {
		return `/src${path}`;
	} else {
		return `/src/routes${currentPath}/${path}`;
	}
}

/**
 * Extract examples from markdown content and eagerly load them.
 *
 * Only examples explicitly referenced in the markdown are loaded - the catalog
 * is NOT used here to avoid loading all examples when only a few are shown.
 *
 * @param markdownContent - The markdown content to extract examples from
 * @param defaultComponent - Optional default component name (from route params)
 * @param type - The type of content ('components' or 'utils')
 * @param currentPath - The current page URL pathname (needed for resolving relative paths)
 * @returns Examples object with loaded components and sources
 */
export async function loadExamplesFromMarkdown(
	markdownContent: string,
	defaultComponent?: string,
	type: 'components' | 'utils' | 'guides' = 'components',
	currentPath?: string
): Promise<Examples> {
	// Extract all <Example component="..." name="..."> from markdown content
	// Also support :example{component="..." name="..."} syntax
	const componentRegex = /<Example\s+([^>]*?)\/>/g;
	const mdcRegex = /:example\{([^}]*?)\}/g;
	const componentMatches = [...markdownContent.matchAll(componentRegex)];
	const mdcMatches = [...markdownContent.matchAll(mdcRegex)];
	const matches = [...componentMatches, ...mdcMatches];

	const componentExamples: Array<{ component: string; name: string }> = [];
	const pathExamples: Array<{ path: string; resolvedPath: string }> = [];

	for (const match of matches) {
		const attrs = match[1];
		const path = attrs.match(/path="([^"]*?)"/)?.[1];

		if (path && currentPath) {
			// Path-based example
			const resolvedPath = resolveExamplePath(path, currentPath, type);
			pathExamples.push({ path, resolvedPath });
		} else {
			// Component/name-based example
			const component = attrs.match(/component="([^"]*?)"/)?.[1] || defaultComponent;
			const name = attrs.match(/name="([^"]*?)"/)?.[1] || null;
			if (component && name) {
				componentExamples.push({ component, name });
			}
		}
	}

	const examples: Examples = {};

	// Load component-based examples in parallel
	await Promise.all(
		componentExamples.map(async (ex) => {
			const loaded = await loadExample(ex.component, ex.name, type === 'guides' ? 'components' : type);
			if (loaded) {
				if (!examples[ex.component]) {
					examples[ex.component] = {};
				}
				examples[ex.component][ex.name] = loaded;
			}
		})
	);

	// Load path-based examples in parallel
	if (pathExamples.length > 0) {
		examples['__path__'] = {};
		await Promise.all(
			pathExamples.map(async (ex) => {
				const loaded = await loadExampleByPath(ex.resolvedPath);
				if (loaded) {
					examples['__path__']![ex.resolvedPath] = loaded;
				}
			})
		);
	}

	return examples;
}

/**
 * Process content only outside of code blocks (``` ... ```)
 * Preserves code block content unchanged while applying transformations elsewhere
 */
function processOutsideCodeBlocks(content: string, processor: (text: string) => string): string {
	// Split by code blocks, preserving the delimiters
	const parts = content.split(/(```[\s\S]*?```)/g);

	return parts
		.map((part, index) => {
			// Odd indices are code blocks (matched by the capture group)
			if (index % 2 === 1) {
				return part; // Keep code blocks unchanged
			}
			return processor(part); // Process non-code-block content
		})
		.join('');
}

// Process markdown content for LLMs by removing custom syntax and converting to vanilla markdown
export function processMarkdownContent(content: string): string {
	// Remove frontmatter (YAML between --- markers at start of file)
	content = content.replace(/^---\n[\s\S]*?\n---\n*/, '');

	// Remove Svelte script blocks and components ONLY outside of code blocks
	content = processOutsideCodeBlocks(content, (text) => {
		// Remove Svelte script blocks
		text = text.replace(/<script[^>]*>[\s\S]*?<\/script>\n*/g, '');
		// Remove Svelte components (self-closing and with content)
		text = text.replace(/<[A-Z][a-zA-Z]*[^>]*\/>\n*/g, '');
		text = text.replace(/<[A-Z][a-zA-Z]*[^>]*>[\s\S]*?<\/[A-Z][a-zA-Z]*>\n*/g, '');
		return text;
	});

	// Extract title from code blocks and add as "File:" line before (must run before tabs processing)
	content = content.replace(/(```\w*)\s+([^\n]*title="[^"]+")[^\n]*$/gm, (_, lang, meta) => {
		const titleMatch = meta.match(/title="([^"]+)"/);
		if (titleMatch) {
			return `File: ${titleMatch[1]} ${lang}`;
		}
		return lang;
	});

	// Process tabs - convert to table
	content = content.replace(
		/:::tabs\{key="([^"]+)"\}\s*([\s\S]*?)(?=\n:::(?:\s*$|\s*\n))\n:::/gm,
		(_, key, tabsContent) => {
			const tabs: { label: string; content: string }[] = [];
			const tabRegex = /::tab\{label="([^"]+)"[^}]*\}\s*([\s\S]*?)\s*(?=\n\s*::(?:\s*$|\s+))\n\s*::/gm;
			let match;
			while ((match = tabRegex.exec(tabsContent)) !== null) {
				tabs.push({ label: match[1], content: match[2].trim() });
			}

			if (tabs.length === 0) return '';

			// Build table with capitalized key as header
			const header = key.charAt(0).toUpperCase() + key.slice(1);
			let table = `| ${header} | Details |\n|-----------|---------|`;
			for (const tab of tabs) {
				// Clean up content: remove :button syntax, convert to links, unwrap code blocks
				const cleanContent = tab.content
					.replace(/:button\{label="([^"]+)"\s+href="([^"]+)"[^}]*\}/g, '[$1]($2)')
					.replace(/```\w*\n([\s\S]*?)```/g, '$1') // Remove code block fences, keep content
					.replace(/\n/g, ' ')
					.trim();
				table += `\n| ${tab.label} | ${cleanContent} |`;
			}
			return table;
		}
	);

	// Convert ::note/:::note, ::tip/:::tip, etc. to blockquote (2 or 3 colons)
	content = content.replace(
		/:{2,3}(note|tip|warning|caution)\s*([\s\S]*?)(?=\n:{2,3}(?:\s*$|\s*\n))\n:{2,3}/gm,
		(_, variant, noteContent) => {
			return `> ${variant}: ${noteContent.trim()}\n`;
		}
	);

	// Convert ::steps to numbered list (convert ## headings to numbered items)
	content = content.replace(/::steps\s*([\s\S]*?)(?=\n::(?:\s*$|\s*\n))\n::/gm, (_, stepsContent: string) => {
		let stepNum = 0;
		return stepsContent.replace(/^## (.+)$/gm, (_match: string, heading: string) => {
			stepNum++;
			return `**${stepNum}. ${heading}**`;
		});
	});

	// Remove any remaining standalone ::
	content = content.replace(/^::\s*$/gm, '');

	// Remove :icon syntax, keep text if in brackets, otherwise just remove icon
	content = content.replace(/\[:icon\{[^}]+\}\s*([^\]]+)\]/g, '$1');
	content = content.replace(/:icon\{[^}]+\}\s*/g, '');

	// Convert :example to reference link
	content = content.replace(
		/:example\{component="([^"]+)"\s+name="([^"]+)"[^}]*\}/g,
		'See example: [$1/$2](https://layerchart.com/docs/components/$1/$2)'
	);

	// Clean up multiple blank lines
	content = content.replace(/\n{3,}/g, '\n\n');

	return content.trim();
}