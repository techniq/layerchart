import { toTitleCase } from '@layerstack/utils';

// Dynamically import all guide markdown files to access their frontmatter
const modules = import.meta.glob('./**/+page.md', { eager: true }) as Record<
	string,
	{ metadata?: Record<string, unknown> }
>;

export const load = async ({ url }) => {
	// Get the last segment of the path (e.g., "features" from "/docs/guides/features")
	const segments = url.pathname.split('/').filter(Boolean);
	const name = segments[segments.length - 1];

	// Get metadata from the markdown file's frontmatter
	const modulePath = `./${name}/+page.md`;
	const module = modules[modulePath];
	const frontmatter = module?.metadata ?? {};

	// Use frontmatter title if available, otherwise derive from path
	const title =
		(frontmatter.title as string) ?? toTitleCase(name.replaceAll('-', ' '));

	return {
		metadata: { ...frontmatter, title }
	};
};
