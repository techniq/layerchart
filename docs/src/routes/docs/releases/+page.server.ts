import { sortFunc } from '@layerstack/utils';
import { allReleases } from 'content-collections';

export async function load() {
	const releases = [...allReleases].sort(sortFunc('date', 'desc'));

	return {
		releases
	};
}
