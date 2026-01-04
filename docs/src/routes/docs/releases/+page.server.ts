import { sortFunc } from '@layerstack/utils';
import { allReleases } from 'content-collections';

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

	return {
		releases,
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
