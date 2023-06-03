import { read } from 'shapefile';

export async function load({ url }) {
	const file = url.searchParams.get('file');
	return {
		file,
		geojson: file ? read(file) : null
	};
}
