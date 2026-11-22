import { sortFunc } from '@layerstack/utils';
import { allReleases } from 'content-collections';
import { releaseDate, releaseName } from '$lib/releases';

const RELEASES_PER_PAGE = 10;

export async function load({ url }) {
	const page = parseInt(url.searchParams.get('page') ?? '1', 10);
	const perPage = parseInt(url.searchParams.get('perPage') ?? String(RELEASES_PER_PAGE), 10);

	// Sort all releases in reverse chronological order
	const allSortedReleases = [...allReleases].sort(sortFunc('date', 'desc'));

	// Calculate pagination
	const totalReleases = allSortedReleases.length;
	const totalPages = Math.ceil(totalReleases / perPage);
	const currentPage = Math.max(1, Math.min(page, totalPages));

	// Get releases for current page
	const startIndex = (currentPage - 1) * perPage;
	const endIndex = startIndex + perPage;
	const releases = allSortedReleases.slice(startIndex, endIndex);

	const latest = allSortedReleases[0];
	return {
		releases,
		// For the tab and link previews
		metadata: {
			name: 'Releases',
			description: latest
				? `Release notes for every version of LayerChart. Latest: ${releaseName(latest)}, released ${releaseDate(latest)}.`
				: 'Release notes for every version of LayerChart.'
		},
		pagination: {
			currentPage,
			totalPages,
			perPage,
			totalReleases,
			hasNextPage: currentPage < totalPages,
			hasPrevPage: currentPage > 1
		}
	};
}
