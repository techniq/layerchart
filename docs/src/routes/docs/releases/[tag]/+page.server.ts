import { allReleases } from 'content-collections';
import { error } from '@sveltejs/kit';
import { releaseChanges, releaseDate, releaseName } from '$lib/releases';

export async function load({ params }) {
	const release = allReleases.find((r) => r.slug === params.tag);

	if (!release) {
		throw error(404, 'Release not found');
	}

	const name = releaseName(release);
	const changes = releaseChanges(release);
	return {
		release,
		// For the tab and link previews (ex. `layerchart 2.3.0`, and `Release notes for layerchart
		// 2.3.0: 5 minor and 12 patch changes, released August 20, 2026.`)
		metadata: {
			name,
			description: `Release notes for ${name}: ${changes ? `${changes}, released` : 'released'} ${releaseDate(release)}.`
		}
	};
}
