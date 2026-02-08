import { defineCollection, defineConfig } from '@content-collections/core';
import { compileMarkdown } from '@content-collections/markdown';
import { toPascalCase } from '@layerstack/utils';
import { z } from 'zod';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { extractTocFromMarkdown } from './src/lib/markdown/toc.js';

const components = defineCollection({
	name: 'components',
	directory: 'src/content/components',
	include: '**/*.md',
	schema: z.object({
		name: z.string().optional(),
		description: z.string().optional(),
		category: z.string().optional(),
		layers: z.array(z.string()).default([]),
		related: z.array(z.string()).default([]),
		resize: z.boolean().optional(),
		tableOfContents: z.boolean().default(true),
		order: z.number().optional(),
		content: z.string()
	}),
	transform: async (doc) => {
		const { filePath, fileName, directory, path } = doc._meta;

		const name = doc.name ?? toPascalCase(fileName.replace('.md', ''));

		// Read the source file from the layerchart package
		const sourcePath = join(
			process.cwd(),
			`../packages/layerchart/src/lib/components/${doc.category === 'charts' && name != 'Chart' ? 'charts/' : ''}${path}.svelte`
		);

		let source = '';
		let sourceUrl = '';
		try {
			source = readFileSync(sourcePath, 'utf-8');
			sourceUrl = `https://github.com/techniq/layerchart/blob/next/packages/layerchart/src/lib/components/${path}.svelte`;
		} catch (error) {
			// console.warn(
			// 	`Could not read source file for ${filePath}: ${error instanceof Error ? error.message : String(error)}`
			// );
		}

		// Extract the first Example component's name from the markdown content
		// Support both <Example name="..."> and :example{name="..."} syntax
		const usageExample =
			doc.content.match(/<Example\s+[^>]*name=["']([^"']+)["'][^>]*>/)?.[1] ||
			doc.content.match(/:example\{[^}]*name=["']([^"']+)["'][^}]*\}/)?.[1];

		// Build TOC from markdown headings + template-rendered sections
		const toc = extractTocFromMarkdown(doc.content);

		const catalogPath = join(process.cwd(), `src/examples/catalog/${path}.json`);
		if (existsSync(catalogPath)) {
			toc.push({ id: 'examples', text: 'Examples', level: 2 });
		}

		const apiPath = join(process.cwd(), `src/generated/api/${path}.json`);
		if (existsSync(apiPath)) {
			try {
				const api = JSON.parse(readFileSync(apiPath, 'utf-8'));
				if (api.properties?.length) {
					toc.push({ id: 'api-reference', text: 'API Reference', level: 2 });
				}
			} catch {
				// ignore
			}
		}

		if (doc.related.length) {
			toc.push({ id: 'related', text: 'Related', level: 2 });
		}

		return {
			...doc,
			name,
			slug: path,
			source,
			sourceUrl,
			usageExample,
			toc
			// html: await compileMarkdown(context, doc)
		};
	}
});

const utils = defineCollection({
	name: 'utils',
	directory: 'src/content/utils',
	include: '**/*.md',
	schema: z.object({
		name: z.string().optional(),
		description: z.string().optional(),
		category: z.string().optional(),
		layers: z.array(z.string()).default([]),
		related: z.array(z.string()).default([]),
		resize: z.boolean().optional(),
		tableOfContents: z.boolean().default(true),
		order: z.number().optional(),
		content: z.string()
	}),
	transform: async (doc) => {
		const { filePath, fileName, directory, path } = doc._meta;

		// Read the source file from the layerchart package
		const sourcePath = join(process.cwd(), `../packages/layerchart/src/lib/utils/${path}.ts`);

		let source = '';
		let sourceUrl = '';
		try {
			source = readFileSync(sourcePath, 'utf-8');
			sourceUrl = `https://github.com/techniq/layerchart/blob/next/packages/layerchart/src/lib/utils/${path}.ts`;
		} catch (error) {
			// console.warn(
			// 	`Could not read source file for ${filePath}: ${error instanceof Error ? error.message : String(error)}`
			// );
		}

		// Extract the first Example component's name from the markdown content
		// Support both <Example name="..."> and :example{name="..."} syntax
		const usageExample =
			doc.content.match(/<Example\s+[^>]*name=["']([^"']+)["'][^>]*>/)?.[1] ||
			doc.content.match(/:example\{[^}]*name=["']([^"']+)["'][^}]*\}/)?.[1];

		return {
			...doc,
			name: doc.name ?? fileName.replace('.md', ''),
			slug: fileName.replace('.md', '').toLowerCase(), // Use lowercase for utils slugs
			source,
			sourceUrl,
			usageExample,
			toc: extractTocFromMarkdown(doc.content)
		};
	}
});

const guides = defineCollection({
	name: 'guides',
	directory: 'src/content/guides',
	include: '**/*.md',
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		order: z.number().optional(),
		draft: z.boolean().default(false),
		content: z.string()
	}),
	transform: async (doc) => {
		const { path } = doc._meta;
		return {
			...doc,
			name: doc.title,
			slug: path,
			toc: extractTocFromMarkdown(doc.content)
		};
	}
});

const releases = defineCollection({
	name: 'releases',
	directory: 'src/content/releases',
	include: '**/*.md',
	schema: z.object({
		title: z.string(),
		tag: z.string(),
		date: z.coerce.date(),
		url: z.string(),
		draft: z.boolean().default(false),
		prerelease: z.boolean().default(false),
		author: z.string(),
		content: z.string()
	}),
	transform: async (doc, context) => {
		const { fileName } = doc._meta;

		return {
			...doc,
			slug: fileName.replace('.md', ''),
			html: await compileMarkdown(context, doc)
		};
	}
});

export default defineConfig({
	collections: [components, utils, guides, releases]
});
