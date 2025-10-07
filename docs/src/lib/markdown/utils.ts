import type { Component } from 'svelte';
import { error } from '@sveltejs/kit';

import { allComponents, type Component as ComponentMetadata } from 'content-collections';

export function getComponentMetadata(slug: string) {
	return allComponents.find((c) => c.slug === slug);
}

function slugFromPath(path: string) {
	return path.replace('/src/content/components/', '').replace('.md', '');
}

export type DocResolver = () => Promise<{ default: Component; metadata: ComponentMetadata }>;

export async function getComponentDoc(slug: string = 'index') {
	const modules = import.meta.glob('/src/content/**/*.md');

	let match: { path?: string; resolver?: DocResolver } = {};

	for (const [path, resolver] of Object.entries(modules)) {
		if (slugFromPath(path) === slug) {
			match = { path, resolver: resolver as unknown as DocResolver };
			break;
		}
	}
	const doc = await match?.resolver?.();
	const metadata = getComponentMetadata(slug);
	if (!doc || !metadata) {
		error(404, 'Could not find the document.');
	}

	return {
		PageComponent: doc.default,
		metadata
	};
}
