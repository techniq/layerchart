import { defineCollection, defineConfig } from '@content-collections/core';
import { compileMarkdown } from '@content-collections/markdown';
import { z } from 'zod';

const components = defineCollection({
	name: 'components',
	directory: 'src/content/components',
	include: '**/*.md',
	schema: z.object({
		description: z.string().optional()
	}),
	transform: async (doc, context) => ({
		...doc,
		slug: doc._meta.path,
		html: await compileMarkdown(context, doc)
	})
});

export default defineConfig({
	collections: [components]
});
