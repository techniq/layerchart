import type { Component } from 'svelte';
import type { ExampleType, LoadedExample } from './examples.js';

export type ContentType = 'components' | 'utils' | 'guides';
export type { Examples } from './examples.js';

export type ExampleReference =
	| { kind: 'component'; component?: string; name: string }
	| { kind: 'path'; path: string };

/**
 * Resolve a relative or absolute example path to the conventional Vite `/src/...` key.
 */
export function resolveExamplePath(path: string, currentPath: string, type?: ContentType): string {
	if (type === 'guides' && (path.startsWith('./') || !path.startsWith('/'))) {
		const relativePath = path.startsWith('./') ? path.slice(2) : path;
		return `/src/content/guides/${relativePath}`;
	}
	if (path.startsWith('./')) {
		return `/src/routes${currentPath}/${path.slice(2)}`;
	}
	if (path.startsWith('/')) {
		return `/src${path}`;
	}
	return `/src/routes${currentPath}/${path}`;
}

/**
 * Extract examples referenced by `<Example ... />` or `:example{...}` markdown syntax.
 */
export function extractExampleReferences(markdownContent: string): ExampleReference[] {
	const componentRegex = /<Example\s+([^>]*?)\/>/g;
	const mdcRegex = /:example\{([^}]*?)\}/g;
	const matches = [...markdownContent.matchAll(componentRegex), ...markdownContent.matchAll(mdcRegex)];

	return matches.flatMap((match): ExampleReference[] => {
		const attrs = match[1];
		const path = attrs.match(/path="([^"]*?)"/)?.[1];
		if (path) return [{ kind: 'path', path }];

		const component = attrs.match(/component="([^"]*?)"/)?.[1];
		const name = attrs.match(/name="([^"]*?)"/)?.[1];
		if (!name) return [];

		return [{ kind: 'component', component, name }];
	});
}

export function getFirstExampleName(markdownContent: string): string | undefined {
	return (
		markdownContent.match(/<Example\s+[^>]*name=["']([^"']+)["'][^>]*>/)?.[1] ||
		markdownContent.match(/:example\{[^}]*name=["']([^"']+)["'][^}]*\}/)?.[1]
	);
}

export type MarkdownModule<Metadata> = {
	default: Component;
	metadata: Metadata;
};

export function createContentLoaders<Metadata extends { content: string }>(options: {
	modules: Record<string, () => Promise<MarkdownModule<Metadata>>>;
	getMetadata: (slug: string, type: ContentType) => Metadata | undefined;
	loadExample: (
		component: string,
		name: string,
		type?: ExampleType
	) => Promise<LoadedExample | null>;
	loadExampleByPath: (path: string) => Promise<LoadedExample | null>;
	notFound: () => never;
}) {
	async function getMarkdownComponent(
		slug = 'index',
		type: ContentType = 'components'
	): Promise<{ PageComponent: Component; metadata: Metadata }> {
		const resolver = options.modules[`/src/content/${type}/${slug}.md`];
		const [doc, metadata] = await Promise.all([resolver?.(), options.getMetadata(slug, type)]);

		if (!doc || !metadata) {
			options.notFound();
		}

		return {
			PageComponent: doc.default,
			metadata
		};
	}

	async function loadExamplesFromMarkdown(
		markdownContent: string,
		defaultComponent?: string,
		type: ContentType = 'components',
		currentPath?: string
	): Promise<Record<string, Record<string, LoadedExample>>> {
		const refs = extractExampleReferences(markdownContent);
		const componentExamples = refs.flatMap((ref) => {
			if (ref.kind !== 'component') return [];
			const component = ref.component ?? defaultComponent;
			if (!component) return [];
			return [{ component, name: ref.name }];
		});
		const pathExamples = refs.flatMap((ref) => {
			if (ref.kind !== 'path' || !currentPath) return [];
			return [{ path: ref.path, resolvedPath: resolveExamplePath(ref.path, currentPath, type) }];
		});

		const examples: Record<string, Record<string, LoadedExample>> = {};

		await Promise.all(
			componentExamples.map(async (ex) => {
				const loaded = await options.loadExample(
					ex.component,
					ex.name,
					type === 'guides' ? 'components' : type
				);
				if (loaded) {
					if (!examples[ex.component]) {
						examples[ex.component] = {};
					}
					examples[ex.component][ex.name] = loaded;
				}
			})
		);

		if (pathExamples.length > 0) {
			examples['__path__'] = {};
			await Promise.all(
				pathExamples.map(async (ex) => {
					const loaded = await options.loadExampleByPath(ex.resolvedPath);
					if (loaded) {
						examples['__path__']![ex.resolvedPath] = loaded;
					}
				})
			);
		}

		return examples;
	}

	return { getMarkdownComponent, loadExamplesFromMarkdown };
}
