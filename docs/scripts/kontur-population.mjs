/**
 * Builds the people in each state for the `WebGL/state-population` example from Kontur Population
 * (November 2023, CC BY 4.0): 400m H3 hexagons, which for the whole US is a 300MB download and an
 * 840MB GeoPackage — too much to commit or fetch on every build.
 *
 *   node scripts/kontur-population.mjs <kontur_population_US_20231101.gpkg>
 *
 * Download and unzip it first:
 * https://geodata-eu-central-1-kontur-public.s3.amazonaws.com/kontur_datasets/kontur_population_US_20231101.gpkg.gz
 *
 * Each hexagon's people go to the 0.01° cell its center is in, and each state's cells (clipped to
 * us-atlas' 1:10m outlines) are summed again into about `COLUMNS` cells across the state.  Its
 * largest places, from Natural Earth's populated places (public domain), are kept to label.
 * Writes `static/data/examples/geo/kontur-population/<state>.json`: the cells as whole steps from
 * the state's southwest corner, and the places as `[name, longitude, latitude]`,
 * `{ origin, step, cells: [i, j, people, ...], cities }`.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { geoBounds, geoContains, geoDistance } from 'd3-geo';
import { feature } from 'topojson-client';

/** us-atlas' territories, which Kontur's US population leaves out */
const TERRITORIES = [
	'American Samoa',
	'Commonwealth of the Northern Mariana Islands',
	'Guam',
	'Puerto Rico',
	'United States Virgin Islands'
];
/** How many places to label in each state, and how far apart, as a share of its size */
const CITIES = 6;
const CITY_SPACING = 0.12;
/** About how many cells across each state, so its hexagons have a few each */
const COLUMNS = 160;
/** The cells hexagons are first summed into, in degrees */
const FINE = 0.01;
const ATLAS_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';
const PLACES_URL =
	'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_populated_places_simple.geojson';
const OUT = 'static/data/examples/geo/kontur-population';

const [source] = process.argv.slice(2);
if (!source) {
	console.error('Usage: node scripts/kontur-population.mjs <kontur_population_US.gpkg>');
	process.exit(1);
}

const topology = await fetch(ATLAS_URL).then((r) => r.json());
const states = feature(topology, topology.objects.states).features.filter(
	(f) => !TERRITORIES.includes(f.properties.name)
);
const places = (await fetch(PLACES_URL).then((r) => r.json())).features
	.map((f) => f.properties)
	.filter((p) => p.adm0_a3 === 'USA');

// Web Mercator (the GeoPackage's EPSG:3857) to and from longitude / latitude
const R = 20037508.342789244;
const toLonLat = (x, y) => [
	(x / R) * 180,
	(2 * Math.atan(Math.exp((y / R) * Math.PI)) - Math.PI / 2) * (180 / Math.PI)
];

/** People in each fine cell, by `i,j` */
const fine = new Map();
const db = new DatabaseSync(source, { readOnly: true });
for (const { population, geom } of db
	.prepare('select population, geom from population')
	.iterate()) {
	// A GeoPackage geometry's header: "GP", version, flags, SRS id, then (as its flags say) its
	// envelope — here `[minx, maxx, miny, maxy]`, whose middle is the hexagon's center
	const flags = geom[3];
	if (((flags >> 1) & 7) === 0) continue;
	const view = new DataView(geom.buffer, geom.byteOffset + 8, 32);
	const little = (flags & 1) === 1;
	const [minx, maxx, miny, maxy] = [0, 8, 16, 24].map((o) => view.getFloat64(o, little));
	const [lon, lat] = toLonLat((minx + maxx) / 2, (miny + maxy) / 2);
	const key = `${Math.round(lon / FINE)},${Math.round(lat / FINE)}`;
	fine.set(key, (fine.get(key) ?? 0) + population);
}
const rows = Array.from(fine, ([key, people]) => {
	const [i, j] = key.split(',').map(Number);
	return [+(i * FINE).toFixed(2), +(j * FINE).toFixed(2), Math.round(people)];
});

mkdirSync(OUT, { recursive: true });
for (const state of states) {
	const [[w, s], [e, n]] = geoBounds(state);
	// Alaska's Aleutians cross the antimeridian, so its west edge is east of its east edge
	const wraps = w > e;
	const width = wraps ? e - w + 360 : e - w;
	const inside = (lon) => (wraps ? lon >= w || lon <= e : lon >= w && lon <= e);
	const lat = (s + n) / 2;
	// Cells about square on the ground: a degree of longitude is shorter than one of latitude
	const across = Math.cos((lat * Math.PI) / 180);
	const step = +(Math.max(width * across, n - s) / COLUMNS).toPrecision(2);
	const stepLon = +(step / across).toPrecision(2);

	const cells = new Map();
	let people = 0;
	for (const [lon, la, count] of rows) {
		if (!inside(lon) || la < s || la > n || !geoContains(state, [lon, la])) continue;
		const key = `${Math.round(lon / stepLon)},${Math.round(la / step)}`;
		cells.set(key, (cells.get(key) ?? 0) + count);
		people += count;
	}
	const entries = Array.from(cells, ([key, count]) => [
		...key.split(',').map(Number),
		Math.round(count)
	]).filter((d) => d[2] > 0);
	const i0 = Math.min(...entries.map((d) => d[0]));
	const j0 = Math.min(...entries.map((d) => d[1]));
	const data = {
		origin: [+(i0 * stepLon).toFixed(4), +(j0 * step).toFixed(4)],
		step: [stepLon, step],
		cells: entries.flatMap(([i, j, count]) => [i - i0, j - j0, count])
	};
	// The largest places, each a little way from those already kept
	const spacing = geoDistance([w, s], [w + width, n]) * CITY_SPACING;
	const cities = [];
	const candidates = places
		.filter((p) => p.adm1name === state.properties.name)
		.sort((a, b) => b.pop_max - a.pop_max);
	for (const p of candidates) {
		if (cities.length >= CITIES) break;
		const at = [p.longitude, p.latitude];
		if (cities.some(([, lon, la]) => geoDistance(at, [lon, la]) < spacing)) continue;
		cities.push([p.name, +p.longitude.toFixed(3), +p.latitude.toFixed(3)]);
	}
	data.cities = cities;

	const slug = state.properties.name.toLowerCase().replace(/ /g, '-');
	writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(data));
	console.log(
		`${slug}: ${entries.length} cells, ${Math.round(people).toLocaleString()} people, ${cities.map((c) => c[0]).join(', ')}`
	);
}

// Every state there's a file for, by its file and name, for the example's list (and prerendering)
writeFileSync(
	join(OUT, 'states.json'),
	JSON.stringify(
		states
			.map((state) => ({
				value: state.properties.name.toLowerCase().replace(/ /g, '-'),
				label: state.properties.name
			}))
			.sort((a, b) => a.label.localeCompare(b.label))
	)
);
