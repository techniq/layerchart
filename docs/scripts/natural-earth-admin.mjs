/**
 * Builds the countries and their states and provinces for the `GeoPath/geojson-drilldown` example from
 * Natural Earth's 10m admin-1 states and provinces (public domain), which is 40MB — too much to
 * commit or fetch on every build.
 *
 *   node scripts/natural-earth-admin.mjs [ne_10m_admin_1_states_provinces.geojson] [ne_10m_admin_0_countries.geojson]
 *
 * Downloads the pinned release unless given copies (of admin-0 too, for each country's continent and
 * World Bank region).  Writes, under `static/data/examples/geo/`:
 *
 * - `admin0.json` — every country, merged from its admin-1 so its borders line up with theirs, and
 *   those merged into `continents` and (World Bank) `worldRegions`, with the fits to fit each to
 * - `admin1/<adm0_a3>.json` — one country's admin-1, with its `regions` and the `fit` to fit it to
 * - `admin1/countries.json` — the `adm0_a3` of every country, for prerendering each
 *
 * See `static/data/examples/geo/admin.d.ts` for their shapes.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { geoArea, geoCentroid, geoDistance } from 'd3-geo';
import { group, groups } from 'd3-array';
import { topology } from 'topojson-server';
import { presimplify, quantile, simplify } from 'topojson-simplify';
import { feature, merge, mergeArcs, quantize } from 'topojson-client';

const ADMIN1_URL =
	'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_1_states_provinces.geojson';
// Only for each country's continent and World Bank region
const ADMIN0_URL =
	'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_0_countries.geojson';
const OUT_DIR = 'static/data/examples/geo';

/**
 * Countries where Natural Earth's admin-1 is the second level down (Italy's provinces, France's
 * departments) and `region` the first (Italy's regions, France's regions).
 */
const REGION_COUNTRIES = new Set(['ESP', 'FRA', 'GBR', 'ITA', 'LVA', 'PHL', 'SVN']);

/** Left out of a country's `fit` as well as its far-off territories — the US fits to its lower 48 */
const FIT_WITHOUT = { USA: ['Alaska', 'Hawaii'] };

/**
 * Natural Earth puts these at sea (`Seven seas (open ocean)`) rather than on a continent, and Russia
 * in Europe — here in Asia, with most of its land, as Natural Earth has Turkey and Kazakhstan
 */
const CONTINENT_OF = {
	RUS: 'Asia',
	ATF: 'Africa',
	CLP: 'North America',
	HMD: 'Africa',
	IOT: 'Africa',
	MDV: 'Asia',
	MUS: 'Africa',
	SGS: 'South America',
	SHN: 'Africa',
	SYC: 'Africa'
};

const [admin1Path, admin0Path] = process.argv.slice(2);
const load = (path, url) =>
	path ? JSON.parse(readFileSync(path, 'utf8')) : fetch(url).then((r) => r.json());
const [source, admin0] = await Promise.all([
	load(admin1Path, ADMIN1_URL),
	load(admin0Path, ADMIN0_URL)
]);
const admin0Of = new Map(
	admin0.features.map(({ properties: d }) => [
		d.ADM0_A3,
		{ continent: CONTINENT_OF[d.ADM0_A3] ?? d.CONTINENT, worldRegion: d.REGION_WB }
	])
);
const byCountry = group(source.features, (d) => d.properties.adm0_a3);

/** A topology of `features`, keeping the `retain` share of each shape's points that matter most */
function simplifiedTopology(features, retain) {
	const topo = presimplify(topology({ admin1: { type: 'FeatureCollection', features } }));
	return simplify(topo, quantile(topo, retain));
}

/**
 * `geometries` without the specks of islands quantizing snapped inside out — which would otherwise
 * cover the rest of the globe
 */
function withoutInsideOut(topo, geometries) {
	return geometries.map((d) => ({
		...d,
		type: 'MultiPolygon',
		arcs: (d.type === 'Polygon' ? [d.arcs] : d.arcs).filter(
			(arcs) => geoArea(feature(topo, { type: 'Polygon', arcs })) < 2 * Math.PI
		)
	}));
}

/**
 * The polygons of `geometries` merged, keeping the largest and those near it — so French Guiana or
 * the Canary Islands don't shrink the country they belong to.  Polygons are near when the gap between
 * them (as circles of the same area) is under ~950km, and chain on from each other.  All of them
 * when that leaves out most of it, as for scattered islands.
 */
function mainland(topo, geometries) {
	const polygons = mergeArcs(topo, geometries).arcs.map((arcs) => {
		const polygon = feature(topo, { type: 'Polygon', arcs });
		const area = geoArea(polygon);
		return { arcs, area, centroid: geoCentroid(polygon), radius: Math.sqrt(area / Math.PI) };
	});

	const largest = polygons.reduce((a, b) => (b.area > a.area ? b : a));
	const near = new Set([largest]);
	for (const a of near) {
		for (const b of polygons) {
			if (!near.has(b) && geoDistance(a.centroid, b.centroid) - a.radius - b.radius < 0.15) {
				near.add(b);
			}
		}
	}

	const area = (polygons) => [...polygons].reduce((sum, d) => sum + d.area, 0);
	const kept = area(near) > area(polygons) / 2 ? [...near] : polygons;
	return { type: 'MultiPolygon', arcs: kept.map((d) => d.arcs) };
}

function write(path, data) {
	writeFileSync(join(OUT_DIR, path), JSON.stringify(data));
}

// Countries
{
	const simplified = simplifiedTopology(source.features, 0.1);
	const countries = groups(simplified.objects.admin1.geometries, (d) => d.properties.adm0_a3).map(
		([id, geometries]) => ({
			type: 'Feature',
			id,
			properties: { name: geometries[0].properties.admin, ...admin0Of.get(id) },
			geometry: merge(simplified, geometries)
		})
	);
	const topo = quantize(
		topology({ countries: { type: 'FeatureCollection', features: countries } }),
		1e5
	);
	const geometries = withoutInsideOut(topo, topo.objects.countries.geometries);
	/** The countries merged by `key`, and the fit to fit each to */
	const merged = (key) => {
		const grouped = groups(geometries, (d) => d.properties[key]);
		return [
			grouped.map(([name, geometries]) => ({
				...mergeArcs(topo, geometries),
				properties: { name }
			})),
			grouped.map(([name, geometries]) => ({ ...mainland(topo, geometries), properties: { name } }))
		].map((geometries) => ({ type: 'GeometryCollection', geometries }));
	};
	const [continents, continentFits] = merged('continent');
	const [worldRegions, worldRegionFits] = merged('worldRegion');
	topo.objects = {
		countries: { type: 'GeometryCollection', geometries },
		continents,
		continentFits,
		worldRegions,
		worldRegionFits
	};
	write('admin0.json', topo);
}

// Each country's admin-1
rmSync(join(OUT_DIR, 'admin1'), { recursive: true, force: true });
mkdirSync(join(OUT_DIR, 'admin1'));
for (const [country, features] of byCountry) {
	const topo = quantize(
		simplifiedTopology(
			features.map((d) => ({
				type: 'Feature',
				id: d.properties.adm1_code,
				properties: {
					name: d.properties.name_en ?? d.properties.name,
					type: d.properties.type_en,
					region: d.properties.region,
					code: d.properties.iso_3166_2,
					fips: d.properties.fips
				},
				geometry: d.geometry
			})),
			0.3
		),
		1e4
	);
	const geometries = withoutInsideOut(topo, topo.objects.admin1.geometries);

	topo.objects = {
		admin1: { type: 'GeometryCollection', geometries },
		...(REGION_COUNTRIES.has(country) && {
			regions: {
				type: 'GeometryCollection',
				geometries: groups(geometries, (d) => d.properties.region).map(([name, geometries]) => ({
					...mergeArcs(topo, geometries),
					properties: { name: name ?? '' }
				}))
			}
		}),
		fit: mainland(
			topo,
			geometries.filter((d) => !FIT_WITHOUT[country]?.includes(d.properties.name))
		)
	};
	write(`admin1/${country}.json`, topo);
}
write('admin1/countries.json', [...byCountry.keys()].sort());

console.log(`Wrote admin0.json and ${byCountry.size} countries' admin-1 to ${OUT_DIR}`);
