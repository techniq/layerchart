import { prerender, getRequestEvent } from '$app/server';

import type { GeometryCollection, Topology } from 'topojson-specification';
import { geoCentroid } from 'd3-geo';
import { csvParse, autoType } from 'd3-dsv';
import { parse } from '@layerstack/utils';

import type { USStateCapitalsData } from '$static/data/examples/geo/us-state-capitals.js';
import type { WorldLinksData } from '$static/data/examples/geo/world-links.js';

export const getUsStatesTopology = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then((r) =>
		r.json()
	)) as Topology<{
		states: GeometryCollection<{ name: string }>;
	}>;
	return data;
});

export const getUsCountiesTopology = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json').then((r) =>
		r.json()
	)) as Topology<{
		states: GeometryCollection<{ name: string }>;
		counties: GeometryCollection<{ name: string }>;
	}>;
	return data;
});

export const getUsCountiesAlbersTopology = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch(
		'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json'
	).then((r) => r.json())) as Topology<{
		states: GeometryCollection<{ name: string }>;
		counties: GeometryCollection<{ name: string }>;
	}>;
	return data;
});

export const getCountriesTopology = prerender(async () => {
	const { fetch } = getRequestEvent();
	const geojson = (await fetch(
		'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
	).then((r) => r.json())) as Topology<{
		countries: GeometryCollection<{ name: string }>;
		land: GeometryCollection;
	}>;
	return geojson;
});

export const getCountriesDetailTopology = prerender(async () => {
	const { fetch } = getRequestEvent();
	const geojson = (await fetch(
		'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json'
	).then((r) => r.json())) as Topology<{
		countries: GeometryCollection<{ name: string }>;
		land: GeometryCollection;
	}>;
	return geojson;
});

export const getEclipses = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/geo/eclipses.json').then(async (r) =>
		parse(await r.text())
	)) as Topology<{
		eclipses: GeometryCollection<{ ID: string; Date: Date }>;
	}>;
	return data;
});

export const getSubmarineCables = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = await fetch('/data/examples/geo/submarine-cables.json').then((r) => r.json());
	return data;
});

export const getSubmarineCablesLandingPoints = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = await fetch('/data/examples/geo/submarine-cables-landing-points.json').then((r) =>
		r.json()
	);
	return data;
});

export const getTectonicPlates = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = await fetch(
		'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json'
	).then((r) => r.json());
	return data;
});

export const getEarthquakes = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = await fetch(
		'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson'
	)
		.then((r) => r.json())
		.then((d: GeoJSON.FeatureCollection<null, { place: string; mag: number }>) =>
			d.features.map((f) => {
				const c = geoCentroid(f);
				return {
					place: f.properties.place,
					magnitude: f.properties.mag,
					longitude: c[0],
					latitude: c[1]
				};
			})
		);
	return data;
});

export const getTimezones = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/geo/timezones.json').then((r) =>
		r.json()
	)) as Topology<{
		timezones: GeometryCollection<{
			objectid: number;
			scalerank: number;
			featurecla: string;
			name: string;
			map_color6: number;
			map_color8: number;
			note: any;
			zone: number;
			utc_format: string;
			time_zone: string;
			iso_8601: string;
			places: string;
			dst_places: any;
			tz_name1st: any;
			tz_namesum: number;
		}>;
	}>;
	return data;
});

export const getUsCapitals = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/geo/us-state-capitals.csv').then(async (r) =>
		csvParse(await r.text(), autoType)
	)) as USStateCapitalsData;
	return data;
});

export const getUsAirports = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/geo/us-airports.csv').then(async (r) =>
		csvParse(await r.text(), autoType)
	)) as { name: string; latitude: number; longitude: number }[];
	return data;
});

export const getUsCountyPopulation = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/geo/us-county-population-2020.json').then((r) =>
		r.json()
	)) as Array<{
		state: string;
		county: string;
		DP05_0001E: string;
		DP05_0019E: string;
		DP05_0019PE: string;
	}>;
	return data;
});

export const getWorldCapitals = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/geo/world-capitals.json').then(async (r) =>
		r.json()
	)) as { label: string; latitude: number; longitude: number }[];
	return data;
});

export const getWorldAirports = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/geo/world-airports.csv').then(async (r) =>
		csvParse(await r.text(), autoType)
	)) as { name: string; latitude: number; longitude: number }[];
	return data;
});

export const getWorldLinks = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/geo/world-links.json').then((r) =>
		r.json()
	)) as WorldLinksData;
	return data;
});
