export function resolveExamplePath(path, currentPath, type) {
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

export function extractExampleReferences(markdownContent) {
	const componentRegex = /<Example\s+([^>]*?)\/>/g;
	const mdcRegex = /:example\{([^}]*?)\}/g;
	const matches = [...markdownContent.matchAll(componentRegex), ...markdownContent.matchAll(mdcRegex)];

	return matches.flatMap((match) => {
		const attrs = match[1];
		const path = attrs.match(/path="([^"]*?)"/)?.[1];
		if (path) return [{ kind: 'path', path }];

		const component = attrs.match(/component="([^"]*?)"/)?.[1];
		const name = attrs.match(/name="([^"]*?)"/)?.[1];
		if (!name) return [];

		return [{ kind: 'component', component, name }];
	});
}

export function getFirstExampleName(markdownContent) {
	return (
		markdownContent.match(/<Example\s+[^>]*name=["']([^"']+)["'][^>]*>/)?.[1] ||
		markdownContent.match(/:example\{[^}]*name=["']([^"']+)["'][^}]*\}/)?.[1]
	);
}

export function createContentLoaders(options) {
	async function getMarkdownComponent(slug = 'index', type = 'components') {
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
		markdownContent,
		defaultComponent,
		type = 'components',
		currentPath
	) {
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

		const examples = {};

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
			examples.__path__ = {};
			await Promise.all(
				pathExamples.map(async (ex) => {
					const loaded = await options.loadExampleByPath(ex.resolvedPath);
					if (loaded) {
						examples.__path__[ex.resolvedPath] = loaded;
					}
				})
			);
		}

		return examples;
	}

	return { getMarkdownComponent, loadExamplesFromMarkdown };
}
