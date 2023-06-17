import { addMinutes, startOfDay, startOfToday, subDays } from 'date-fns';
import { degreesToRadians, radiansToDegrees } from './math';

/**
 * Get random number between min (inclusive) and max (exclusive)
 *   see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_number_between_0_inclusive_and_1_exclusive
 */
export function getRandomNumber(min: number, max: number) {
	return Math.random() * (max - min) + min;
}

/**
 * Get random integer between min (inclusive) and max (inclusive by default)
 *   see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values_inclusive
 */
export function getRandomInteger(min: number, max: number, includeMax = true) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + (includeMax ? 1 : 0)) + min);
}

export function createDateSeries(options: {
	count?: number;
	min: number;
	max: number;
	keys?: Array<string>;
	value?: 'number' | 'integer';
}) {
	const now = startOfToday();

	const count = options.count ?? 10;
	const min = options.min;
	const max = options.max;
	const keys = options.keys ?? ['value'];

	return Array.from({ length: count }).map((_, i) => {
		return {
			date: subDays(now, count - i - 1),
			...Object.fromEntries(
				keys.map((key) => {
					return [
						key,
						options.value === 'integer' ? getRandomInteger(min, max) : getRandomNumber(min, max)
					];
				})
			)
		};
	});
}

export function createTimeSeries(options: {
	count?: number;
	min: number;
	max: number;
	keys: Array<string>;
	value: 'number' | 'integer';
}) {
	const count = options.count ?? 10;
	const min = options.min;
	const max = options.max;
	const keys = options.keys ?? ['value'];

	let lastStartDate = startOfDay(new Date());

	const timeSeries = Array.from({ length: count }).map((_, i) => {
		const startDate = addMinutes(lastStartDate, getRandomInteger(0, 60));
		const endDate = addMinutes(startDate, getRandomInteger(5, 60));
		lastStartDate = startDate;
		return {
			name: `item ${i + 1}`,
			startDate,
			endDate,
			...Object.fromEntries(
				keys.map((key) => {
					return [
						key,
						options.value === 'integer' ? getRandomInteger(min, max) : getRandomNumber(min, max)
					];
				})
			)
		};
	});

	return timeSeries;
}

export const wideData = [
	{ year: '2019', apples: 3840, bananas: 1920, cherries: 960, dates: 400 },
	{ year: '2018', apples: 1600, bananas: 1440, cherries: 960, dates: 400 },
	{ year: '2017', apples: 820, bananas: 1000, cherries: 640, dates: 400 },
	{ year: '2016', apples: 820, bananas: 560, cherries: 720, dates: 400 }
];

export const longData = [
	{ year: '2019', basket: 1, fruit: 'apples', value: 3840 },
	{ year: '2019', basket: 1, fruit: 'bananas', value: 1920 },
	{ year: '2019', basket: 2, fruit: 'cherries', value: 960 },
	{ year: '2019', basket: 2, fruit: 'dates', value: 400 },

	{ year: '2018', basket: 1, fruit: 'apples', value: 1600 },
	{ year: '2018', basket: 1, fruit: 'bananas', value: 1440 },
	{ year: '2018', basket: 2, fruit: 'cherries', value: 960 },
	{ year: '2018', basket: 2, fruit: 'dates', value: 400 },

	{ year: '2017', basket: 1, fruit: 'apples', value: 820 },
	{ year: '2017', basket: 1, fruit: 'bananas', value: 1000 },
	{ year: '2017', basket: 2, fruit: 'cherries', value: 640 },
	{ year: '2017', basket: 2, fruit: 'dates', value: 400 },

	{ year: '2016', basket: 1, fruit: 'apples', value: 820 },
	{ year: '2016', basket: 1, fruit: 'bananas', value: 560 },
	{ year: '2016', basket: 2, fruit: 'cherries', value: 720 },
	{ year: '2016', basket: 2, fruit: 'dates', value: 400 }
];

export function getPhyllotaxis({ radius, count, width, height }) {
	// Phyllotaxis: https://www.youtube.com/watch?v=KWoJgHFYWxY
	const rads = Math.PI * (3 - Math.sqrt(5)); // ~2.4 rads or ~137.5 degrees
	return getSpiral({ angle: radiansToDegrees(rads), radius, count, width, height });
}

export function getSpiral({ angle, radius, count, width, height }) {
	return Array.from({ length: count }, (_, i) => {
		const r = radius * Math.sqrt(i);
		const a = degreesToRadians(angle * i);
		return {
			x: width / 2 + r * Math.cos(a),
			y: height / 2 + r * Math.sin(a)
		};
	});
}
