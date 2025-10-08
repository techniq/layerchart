import { defineCollection, defineConfig } from '@content-collections/core';
// import { compileMarkdown } from '@content-collections/markdown';
import { toPascalCase } from '@layerstack/utils';
import { z } from 'zod';
import { readFileSync } from 'fs';
import { join } from 'path';

const components = defineCollection({
	name: 'components',
	directory: 'src/content/components',
	include: '**/*.md',
	schema: z.object({
		description: z.string().optional(),
		layers: z.array(z.string()).default([]),
		related: z.array(z.string()).default([])
	}),
	transform: async (doc) => {
		const { filePath, fileName, directory, path } = doc._meta;

		// Read the source file from the layerchart package
		const sourcePath = join(
			process.cwd(),
			`../packages/layerchart/src/lib/components/${path}.svelte`
		);

		let source = '';
		try {
			source = readFileSync(sourcePath, 'utf-8');
		} catch (error) {
			// console.warn(
			// 	`Could not read source file for ${filePath}: ${error instanceof Error ? error.message : String(error)}`
			// );
		}

		return {
			...doc,
			name: toPascalCase(fileName.replace('.md', '')),
			slug: path,
			source,
			section: directory
			// html: await compileMarkdown(context, doc)
		};
	}
});

export default defineConfig({
	collections: [components]
});
