import { celsiusToFahrenheit } from 'layerchart';
import { parse, sortFunc } from '@layerstack/utils';
import { ascending, flatGroup, max, mean, min } from 'd3-array';
import { csvParse, csvParseRows, autoType } from 'd3-dsv';

import { prerender, getRequestEvent, query } from '$app/server';
import { z } from 'zod';

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

export const getAppleStockRange = query(
	z.object({
		start: z.string().optional(),
		end: z.string().optional(),
		maxPoints: z.number().optional().default(300)
	}),
	async ({ start, end, maxPoints }) => {
		const { fetch } = getRequestEvent();
		let data = await fetch('/data/examples/date/apple-stock.json').then(async (r) =>
			parse<AppleStockData>(await r.text())
		);

		if (start || end) {
			const startDate = start ? new Date(start) : undefined;
			const endDate = end ? new Date(end) : undefined;
			data = data.filter(
				(d) => (!startDate || d.date >= startDate) && (!endDate || d.date <= endDate)
			);
		}

		if (data.length > maxPoints) {
			const step = (data.length - 1) / (maxPoints - 1);
			data = Array.from({ length: maxPoints }, (_, i) => data![Math.round(i * step)]);
		}

		return data;
	}
);

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

export const getSimpleTree = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = await fetch('/data/examples/hierarchy/simple-tree.json').then((r) => r.json());
	return data;
});

export type MetroData = {
	Metro: string;
	POP_1980: number;
	LPOP_1980: number;
	R90_10_1980: number;
	POP_2015: number;
	LPOP_2015: number;
	R90_10_2015: number;
	nyt_display: string;
	state_display: string;
	highlight: number;
};

export const getMetros = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = csvParse(
		await (await fetch('/data/examples/metros.csv')).text(),
		autoType
	) as unknown as MetroData[];
	return data;
});

export const getUsSenators = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/us-senators.csv').then(async (r) =>
		csvParse(await r.text(), autoType)
	)) as USSenatorsData;
	return data;
});

export type UsPresident = {
	name: string;
	inaugurationDate: Date;
	portraitUrl: string;
	veryFavorable: number;
	veryUnfavorable: number;
};

export const getUsPresidents = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = await fetch('/data/examples/us-presidents.csv').then(async (r) => {
		// @ts-expect-error - autoType
		const rows = csvParse(await r.text(), autoType) as Array<Record<string, any>>;
		return rows.map(
			(d) =>
				({
					name: d['Name'],
					inaugurationDate: d['First Inauguration Date'],
					portraitUrl: d['Portrait URL'],
					veryFavorable: d['Very Favorable %'],
					veryUnfavorable: d['Very Unfavorable %']
				}) satisfies UsPresident
		);
	});
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

export type SvelteCount = {
	date: Date;
	n: number;
	cumsum: number;
	category: 'svelte' | 'sveltekit';
};

export const getSvelteCounts = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = await fetch('/data/examples/date/svelte-counts.csv').then(async (r) =>
		// @ts-expect-error - autoType
		csvParse<SvelteCount>(await r.text(), autoType)
	);
	return data;
});

export type SvelteMilestone = {
	date: Date;
	category: 'svelte' | 'sveltekit' | 'ecosystem';
	label: string;
	x: Date;
	y: number;
};

export const getSvelteMilestones = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = await fetch('/data/examples/date/svelte-milestones.csv').then(async (r) =>
		// @ts-expect-error - autoType
		csvParse<SvelteMilestone>(await r.text(), autoType)
	);
	return data;
});

export const getAppleTicker = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = await fetch('/data/examples/date/apple-ticker.json').then(async (r) =>
		parse<AppleTickerData>(await r.text())
	);
	return data;
});

export const getCars = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = await fetch('/data/examples/cars.csv').then(async (r) =>
		// @ts-expect-error - shh
		csvParse<CarData>(await r.text(), autoType)
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

export type CountryGdpLifeExpectancy = {
	title: string;
	id: string;
	continent: string;
	x: number;
	y: number;
	value: number;
};

export const getCountryGdpLifeExpectancy = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/country-gdp-life-expectancy.json').then((r) =>
		r.json()
	)) as CountryGdpLifeExpectancy[];
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

export const getWideData = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/bench/wide_data/data.json').then((r) => r.json())) as {
		epoch: number;
		idl: number;
		recv: number;
		send: number;
		writ: number;
		used: number;
		free: number;
	}[];
	return data;
});

export const getDimensionArrays = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/bench/dimension_arrays/data.json').then((r) =>
		r.json()
	)) as {
		date: number[];
		cpu: number[];
		ram: number[];
		tcp: number[];
	};
	return data;
});

export const getSeriesArrays = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/bench/series_arrays/data.json').then((r) =>
		r.json()
	)) as {
		cpu: {
			x: Date;
			y: number;
		}[];
		ram: {
			x: Date;
			y: number;
		}[];
		tcp: {
			x: Date;
			y: number;
		}[];
	};
	return data;
});

export type VolcanoData = {
	width: number;
	height: number;
	values: number[];
};

export const getVolcano = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/volcano.json').then((r) => r.json())) as VolcanoData;
	return data;
});

export type WaterVaporData = {
	width: number;
	height: number;
	values: number[];
};

export const getWaterVapor = prerender(async () => {
	const { fetch } = getRequestEvent();
	const rows = csvParseRows(
		await fetch('/data/examples/geo/water-vapor.csv').then((r) => r.text())
	);
	return {
		width: rows[0]?.length ?? 0,
		height: rows.length,
		values: rows.flat().map((value) => (value === '99999.0' ? NaN : +value))
	} satisfies WaterVaporData;
});

export type FaithfulData = { eruptions: number; waiting: number };

export const getFaithful = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/faithful.json').then((r) =>
		r.json()
	)) as FaithfulData[];
	return data;
});

export type CategoryBrand = {
	date: Date;
	name: string;
	category: string;
	value: number;
};

export const getCategoryBrands = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/category-brands.csv').then(async (r) =>
		csvParse(await r.text(), autoType)
	)) as unknown as CategoryBrand[];

	// Ensure dates are Date objects
	for (const d of data) {
		d.date = new Date(d.date as unknown as string);
	}

	return data;
});

export type ProgrammingLanguage = {
	date: Date;
	name: string;
	value: number;
};

export const getProgrammingLanguages = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/programming-languages.csv').then(async (r) =>
		csvParse(await r.text(), autoType)
	)) as unknown as ProgrammingLanguage[];

	for (const d of data) {
		d.date = new Date(d.date as unknown as string);
	}

	return data;
});

export const getShapeData = query(z.string().nullable(), async (file) => {
	if (!file) return null;
	const { fetch } = getRequestEvent();
	const geojson = await fetch(file).then((r) => r.json());
	return geojson;
});

export type TdfStageData = { long: number; lat: number; elev: number }[];

export const getTdfStage = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/geo/tdf-stage.json').then((r) =>
		r.json()
	)) as TdfStageData;
	return data;
});
