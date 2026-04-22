import { defineCollection, defineConfig } from '@content-collections/core';
import { compileMarkdown } from '@content-collections/markdown';
import { toPascalCase } from '@layerstack/utils';
import { z } from 'zod';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';
import { prettyCodeOptions } from './src/lib/markdown/config/index.js';
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
		/**
		 * Whether the component renders inside an `<Svg|Canvas|Html>` layer.
		 * Set to `false` for components that live outside any layer (e.g.
		 * Legend, CircleLegend, GeoLegend) — they don't constrain which layers
		 * the rest of the chart can render into and are skipped when
		 * intersecting example layer support.
		 */
		withinLayer: z.boolean().default(true),
		related: z.array(z.string()).default([]),
		resize: z.boolean().optional(),
		tableOfContents: z.boolean().default(true),
		order: z.number().optional(),
		content: z.string()
	}),
	transform: async (doc, context) => {
		const { filePath, fileName, directory, path } = doc._meta;

		const name = doc.name ?? toPascalCase(fileName.replace('.md', ''));

		// Read the source file from the layerchart package
		// Determine the subfolder based on category and component name
		let subfolder = '';
		if (doc.category === 'charts' && name !== 'Chart') {
			subfolder = 'charts/';
		} else if (doc.category === 'layers' || name === 'Layer') {
			subfolder = 'layers/';
		}
		const sourcePath = join(
			process.cwd(),
			`../packages/layerchart/src/lib/components/${subfolder}${path}.svelte`
		);

		let source = '';
		let sourceUrl = '';
		try {
			source = readFileSync(sourcePath, 'utf-8');
			sourceUrl = `https://github.com/techniq/layerchart/blob/next/packages/layerchart/src/lib/components/${subfolder}${path}.svelte`;
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
		let catalogFirstExample: string | undefined;
		if (existsSync(catalogPath)) {
			// Only add "Examples" TOC entry if not already present from markdown headings
			if (!toc.some((t) => t.id === 'examples')) {
				toc.push({ id: 'examples', text: 'Examples', level: 2 });
			}
			try {
				const catalog = JSON.parse(readFileSync(catalogPath, 'utf-8'));
				catalogFirstExample = catalog.examples?.[0]?.name;
			} catch {
				// ignore
			}
		}

		// Best example to use: first from docs markdown, fallback to first in catalog
		const defaultExample = usageExample ?? catalogFirstExample;

		const apiPath = join(process.cwd(), `generated/api/${path}.json`);
		let api: any = null;
		if (existsSync(apiPath)) {
			try {
				api = JSON.parse(readFileSync(apiPath, 'utf-8'));

				const renderInline = async (text: string) => {
					const html = await compileMarkdown(
						context,
						{ ...doc, content: text } as any,
						{ remarkPlugins: [remarkGfm] }
					);
					return html
						.replace(/^<p>/, '')
						.replace(/<\/p>\s*$/, '')
						.trim();
				};

				const walk = async (props: any[] = []) => {
					for (const p of props) {
						if (p.description) p.descriptionHtml = await renderInline(p.description);
						if (p.properties) await walk(p.properties);
					}
				};
				await walk(api.properties);

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
			defaultExample,
			toc,
			api
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

		return {
			...doc,
			name: doc.name ?? fileName.replace('.md', ''),
			slug: fileName.replace('.md', '').toLowerCase(), // Use lowercase for utils slugs
			source,
			sourceUrl,
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
		category: z.string().optional(),
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
	directory: 'generated/releases',
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
			html: await compileMarkdown(context, doc, {
				remarkPlugins: [remarkGfm],
				rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]]
			})
		};
	}
});

export default defineConfig({
	content: [components, utils, guides, releases]
});
