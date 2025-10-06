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
		supportedContexts: z.array(z.string()).default([]),
		related: z.array(z.string()).default([])
	}),
	transform: async (doc) => {
		const { directory, fileName, path } = doc._meta;

		// Read the source file from the layerchart package
		const componentName = toPascalCase(fileName.replace('.md', ''));
		const sourcePath = join(
			process.cwd(),
			'../packages/layerchart/src/lib/components/charts',
			`${componentName}.svelte`
		);

		let source = '';
		try {
			source = readFileSync(sourcePath, 'utf-8');
		} catch (error) {
			console.warn(
				`Could not read source file for ${componentName}: ${error instanceof Error ? error.message : String(error)}`
			);
		}

		return {
			...doc,
			name: componentName,
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
