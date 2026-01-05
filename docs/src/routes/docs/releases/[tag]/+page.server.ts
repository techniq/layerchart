import { allReleases } from 'content-collections';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const release = allReleases.find((r) => r.slug === params.tag);

	if (!release) {
		throw error(404, 'Release not found');
	}

	return {
		release
	};
}
