import { celsiusToFahrenheit } from 'layerchart';
import { parse, sortFunc } from '@layerstack/utils';
import { ascending, flatGroup, max, mean, min } from 'd3-array';
import { csvParse, autoType } from 'd3-dsv';

import { prerender, getRequestEvent } from '$app/server';

import type { PenguinsData } from '$static/data/examples/penguins.js';
import type { AppleStockData } from '$static/data/examples/date/apple-stock.js';
import type { USSenatorsData } from '$static/data/examples/us-senators';
import type { CivilizationTimeline } from '$static/data/examples/date/civilization-timeline.js';
import type { HydroData } from '$static/data/examples/date/hydro.js';
import type { AppleTickerData } from '$static/data/examples/date/apple-ticker.js';
import type { NewPassengerCars } from '$static/data/examples/new-passenger-cars.js';

export const getGroupData = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/group-data.json').then((r) => r.json())) as {
		x: number;
		y: number;
		group: string;
	}[];
	return data;
});

export const getAppleStock = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = await fetch('/data/examples/date/apple-stock.json').then(async (r) =>
		parse<AppleStockData>(await r.text())
	);
	return data;
});

export const getDailyTemperature = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = await fetch('/data/examples/date/daily-temperature.json').then(async (r) =>
		parse<{ date: Date; value: number }[]>(await r.text())
	);
	return data;
});

export const getDailyTemperatures = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = await fetch('/data/examples/dailyTemperatures.csv').then(async (r) => {
		return csvParse<{ dayOfYear: number; year: number; value: number | 'NA' }>(
			await r.text(),
			// @ts-expect-error - autoType
			autoType
		)
			.filter((d) => d.value !== 'NA' && d.dayOfYear <= 365 /* Ignore 366th day */)
			.map((d) => {
				const origDate = new Date(d.year, 0, d.dayOfYear);
				return {
					...d,
					date: new Date(Date.UTC(2000, origDate.getUTCMonth(), origDate.getUTCDate())),
					value: d.value !== 'NA' ? celsiusToFahrenheit(d.value) : 'NA'
				};
			});
	});
	return data;
});

export const getSfoTemperatures = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = await fetch('/data/examples/sfoTemperatures.csv').then(async (r) => {
		return flatGroup(
			// @ts-expect-error - autoType
			csvParse<{ date: Date; tavg: number; tmax: number; tmin: number }>(await r.text(), autoType),
			(d) => new Date(Date.UTC(2000, d.date.getUTCMonth(), d.date.getUTCDate())) // group by day of year
		)
			.sort(([a], [b]) => ascending(a, b)) // sort chronologically
			.map(([date, v]) => ({
				date,
				avg: mean(v, (d) => d.tavg || NaN),
				min: mean(v, (d) => d.tmin || NaN),
				max: mean(v, (d) => d.tmax || NaN),
				minmin: min(v, (d) => d.tmin || NaN),
				maxmax: max(v, (d) => d.tmax || NaN)
			}));
	});
	return data;
});

export const getPenguins = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/penguins.csv').then(async (r) =>
		csvParse(await r.text(), autoType)
	)) as PenguinsData;
	return data;
});

export const getFlare = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = await fetch('/data/examples/hierarchy/flare.json').then((r) => r.json());
	return data;
});

export const getUsSenators = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/us-senators.csv').then(async (r) =>
		csvParse(await r.text(), autoType)
	)) as USSenatorsData;
	return data;
});

export const getAlphabet = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/alphabet.csv').then(async (r) =>
		csvParse(await r.text(), autoType)
	)) as { letter: string; frequency: number }[];
	return data;
});

export const getOlympians = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/olympians.json').then((r) => r.json())) as {
		name: string;
		weight: number;
		height: number;
	}[];
	return data;
});

export const getUsEvents = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = await fetch('/data/examples/date/us-events.csv').then(async (r) => {
		return csvParse(await r.text(), autoType).map((d: any) => {
			return {
				startDate: new Date(d.startYear, 0, 1),
				endDate: new Date(d.endYear, 11, 31),
				event: d.event
			};
		});
	});
	return data;
});

export const getCivilizationEvents = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = await fetch('/data/examples/date/civilization-timeline.csv').then(async (r) => {
		return csvParse<CivilizationTimeline>(
			await r.text(),
			// @ts-expect-error - shh
			autoType
		).sort(sortFunc('start'));
	});

	return data;
});

export const getAppleTicker = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = await fetch('/data/examples/date/apple-ticker.json').then(async (r) =>
		parse<AppleTickerData>(await r.text())
	);
	return data;
});

export const getNewPassengerCars = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = await fetch('/data/examples/new-passenger-cars.csv').then(async (r) =>
		// @ts-expect-error - shh
		csvParse<NewPassengerCars>(await r.text(), autoType)
	);
	return data;
});

export const getHydro = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/date/hydro.json').then(async (r) =>
		parse(await r.text())
	)) as HydroData;
	return data;
});

export const getForceGroupDots = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/force-group-dots.json').then((r) => r.json())) as {
		category: string;
		value: number;
	}[];
	return data;
});
