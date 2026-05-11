import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { defineCollection, defineConfig } from '@content-collections/core';
import { compileMarkdown } from '@content-collections/markdown';
import { toPascalCase } from '@layerstack/utils';
import { z } from 'zod';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';
import { extractTocFromMarkdown } from '../markdown/index.js';
import { prettyCodeOptions } from '../markdown/config/pretty-code.js';
import { getFirstExampleName } from '../content.js';

export const componentSchema = z.object({
	name: z.string().optional(),
	description: z.string().optional(),
	category: z.string().optional(),
	layers: z.array(z.string()).default([]),
	withinLayer: z.boolean().default(true),
	related: z.array(z.string()).default([]),
	resize: z.boolean().optional(),
	tableOfContents: z.boolean().default(true),
	order: z.number().optional(),
	content: z.string()
});

export const utilSchema = z.object({
	name: z.string().optional(),
	description: z.string().optional(),
	category: z.string().optional(),
	layers: z.array(z.string()).default([]),
	related: z.array(z.string()).default([]),
	resize: z.boolean().optional(),
	tableOfContents: z.boolean().default(true),
	order: z.number().optional(),
	content: z.string()
});

export const guideSchema = z.object({
	title: z.string(),
	description: z.string().optional(),
	category: z.string().optional(),
	order: z.number().optional(),
	draft: z.boolean().default(false),
	content: z.string()
});

export const releaseSchema = z.object({
	title: z.string(),
	tag: z.string(),
	date: z.coerce.date(),
	url: z.string(),
	draft: z.boolean().default(false),
	prerelease: z.boolean().default(false),
	author: z.string(),
	content: z.string()
});

function sourceBase(options) {
	return `https://github.com/${options.repo}/blob/${options.branch}/packages/${options.packageName}/src/lib`;
}

function readSource(root, sourceUrlBase, rel) {
	const full = join(root, rel);
	if (!existsSync(full)) return null;
	try {
		return {
			source: readFileSync(full, 'utf-8'),
			url: `${sourceUrlBase}/${rel}`
		};
	} catch {
		return null;
	}
}

function normalizeOptions(options) {
	return {
		packageName: options.packageName,
		repo: options.repo ?? `techniq/${options.packageName}`,
		branch: options.branch ?? 'next'
	};
}

export function createContentConfig(options) {
	const normalized = normalizeOptions(options);
	const packageRoot = join(process.cwd(), `../packages/${normalized.packageName}/src/lib`);
	const githubBase = sourceBase(normalized);

	const components = defineCollection({
		name: 'components',
		directory: 'src/content/components',
		include: '**/*.md',
		schema: componentSchema,
		transform: async (doc, context) => {
			const { fileName, path } = doc._meta;
			const name = doc.name ?? toPascalCase(fileName.replace('.md', ''));
			const componentsRoot = join(packageRoot, 'components');
			const componentsSourceBase = `${githubBase}/components`;

			const subdirs = existsSync(componentsRoot)
				? readdirSync(componentsRoot).filter(
						(entry) =>
							!entry.startsWith('.') && statSync(join(componentsRoot, entry)).isDirectory()
					)
				: [];
			const searchDirs = ['', ...subdirs.map((d) => `${d}/`)];

			const sources = {};
			const sourceUrls = {};
			let primary = null;
			let splitDir = '';

			for (const dir of searchDirs) {
				const hit =
					readSource(componentsRoot, componentsSourceBase, `${dir}${path}/${path}.base.svelte`) ??
					readSource(componentsRoot, componentsSourceBase, `${dir}${path}/${path}.svelte`) ??
					readSource(componentsRoot, componentsSourceBase, `${dir}${path}.svelte`);
				if (hit) {
					primary = hit;
					splitDir = `${dir}${path}/`;
					break;
				}
			}

			if (primary && !primary.url.endsWith('.base.svelte')) {
				for (const layer of ['svg', 'canvas', 'html']) {
					const variant = readSource(
						componentsRoot,
						componentsSourceBase,
						`${splitDir}${path}.${layer}.svelte`
					);
					if (variant) {
						sources[layer] = variant.source;
						sourceUrls[layer] = variant.url;
					}
				}
			}

			const toc = extractTocFromMarkdown(doc.content);
			const catalogPath = join(process.cwd(), `src/examples/catalog/${path}.json`);
			let catalogFirstExample;

			if (existsSync(catalogPath)) {
				if (!toc.some((t) => t.id === 'examples')) {
					toc.push({ id: 'examples', text: 'Examples', level: 2 });
				}
				try {
					const catalog = JSON.parse(readFileSync(catalogPath, 'utf-8'));
					catalogFirstExample = catalog.examples?.[0]?.name;
				} catch {
					// ignore malformed generated catalog files
				}
			}

			const apiPath = join(process.cwd(), `generated/api/${path}.json`);
			let api = null;
			if (existsSync(apiPath)) {
				try {
					api = JSON.parse(readFileSync(apiPath, 'utf-8'));

					const renderInline = async (text) => {
						const html = await compileMarkdown(context, { ...doc, content: text }, {
							remarkPlugins: [remarkGfm]
						});
						return html
							.replace(/^<p>/, '')
							.replace(/<\/p>\s*$/, '')
							.trim();
					};

					const walk = async (props = []) => {
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
					// ignore malformed generated API files
				}
			}

			if (doc.related.length) {
				toc.push({ id: 'related', text: 'Related', level: 2 });
			}

			return {
				...doc,
				name,
				slug: path,
				source: primary?.source ?? '',
				sourceUrl: primary?.url ?? '',
				sources,
				sourceUrls,
				defaultExample: getFirstExampleName(doc.content) ?? catalogFirstExample,
				toc,
				api
			};
		}
	});

	const utils = defineCollection({
		name: 'utils',
		directory: 'src/content/utils',
		include: '**/*.md',
		schema: utilSchema,
		transform: async (doc) => {
			const { fileName, path } = doc._meta;
			const source = readSource(join(packageRoot, 'utils'), `${githubBase}/utils`, `${path}.ts`);

			return {
				...doc,
				name: doc.name ?? fileName.replace('.md', ''),
				slug: fileName.replace('.md', '').toLowerCase(),
				source: source?.source ?? '',
				sourceUrl: source?.url ?? '',
				toc: extractTocFromMarkdown(doc.content)
			};
		}
	});

	const guides = defineCollection({
		name: 'guides',
		directory: 'src/content/guides',
		include: '**/*.md',
		schema: guideSchema,
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
		schema: releaseSchema,
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

	return defineConfig({
		content: [components, utils, guides, releases]
	});
}
