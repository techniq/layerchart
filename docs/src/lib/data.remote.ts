import { celsiusToFahrenheit } from 'layerchart';
import { parse } from '@layerstack/utils';
import { ascending, flatGroup, max, mean, min } from 'd3-array';
import { csvParse, autoType } from 'd3-dsv';

import { prerender, getRequestEvent } from '$app/server';

import type { PenguinsData } from '$static/data/examples/penguins.js';
import type { AppleStockData } from '$static/data/examples/date/apple-stock.js';

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
