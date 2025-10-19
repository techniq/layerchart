import { timeMinute, timeDay } from 'd3-time';
import { cumsum } from 'd3-array';
import { randomNormal } from 'd3-random';

// Math utility functions
function degreesToRadians(degrees: number): number {
	return degrees * (Math.PI / 180);
}

function radiansToDegrees(radians: number): number {
	return radians * (180 / Math.PI);
}

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

/**
 * @see: https://observablehq.com/@d3/d3-cumsum
 */
export function randomWalk(options?: { count?: number }) {
	const random = randomNormal();
	// @ts-expect-error cumsum expects an array but we're passing an object with length property
	return Array.from(cumsum({ length: options?.count ?? 100 }, random));
}

export function createSeries<TKey extends string>(options: {
	count?: number;
	min: number;
	max: number;
	keys?: TKey[];
	value?: 'number' | 'integer';
}) {
	const count = options.count ?? 10;
	const min = options.min;
	const max = options.max;
	const keys = options.keys ?? ['y'];

	return Array.from({ length: count }).map((_, i) => {
		return {
			x: options.value === 'integer' ? getRandomInteger(min, max) : getRandomNumber(min, max),
			...Object.fromEntries(
				keys.map((key) => {
					return [
						key,
						options.value === 'integer' ? getRandomInteger(min, max) : getRandomNumber(min, max)
					];
				})
			)
		} as { x: number } & { [K in TKey]: number };
	});
}

export function createDateSeries<TKey extends string>(
	options: {
		count?: number;
		min?: number;
		max?: number;
		keys?: TKey[];
		value?: 'number' | 'integer';
	} = {}
) {
	const now = timeDay.floor(new Date());

	const count = options.count ?? 10;
	const min = options.min ?? 0;
	const max = options.max ?? 100;
	const keys = options.keys ?? ['value'];
	const valueType = options.value ?? 'number';

	return Array.from({ length: count }).map((_, i) => {
		return {
			date: timeDay.offset(now, -count + i),
			...Object.fromEntries(
				keys.map((key) => {
					return [
						key,
						valueType === 'integer' ? getRandomInteger(min, max) : getRandomNumber(min, max)
					];
				})
			)
		} as { date: Date } & { [K in TKey]: number };
	});
}

export function createTimeSeries<TKey extends string>(
	options: {
		count?: number;
		min?: number;
		max?: number;
		keys?: TKey[];
		value?: 'number' | 'integer';
	} = {}
) {
	const count = options.count ?? 10;
	const min = options.min ?? 0;
	const max = options.max ?? 100;
	const keys = options.keys ?? ['value'];
	const valueType = options.value ?? 'number';

	let lastStartDate = timeDay.floor(new Date());

	const timeSeries = Array.from({ length: count }).map((_, i) => {
		const startDate = timeMinute.offset(lastStartDate, getRandomInteger(0, 60));
		const endDate = timeMinute.offset(startDate, getRandomInteger(5, 60));
		lastStartDate = startDate;
		return {
			name: `item ${i + 1}`,
			startDate,
			endDate,
			...Object.fromEntries(
				keys.map((key) => {
					return [
						key,
						valueType === 'integer' ? getRandomInteger(min, max) : getRandomNumber(min, max)
					];
				})
			)
		} as { name: string; startDate: Date; endDate: Date } & { [K in TKey]: number };
	});

	return timeSeries;
}

export const wideData = [
	{ year: 2019, apples: 3840, bananas: 1920, cherries: 960, grapes: 400 },
	{ year: 2018, apples: 1600, bananas: 1440, cherries: 960, grapes: 400 },
	{ year: 2017, apples: 820, bananas: 1000, cherries: 640, grapes: 400 },
	{ year: 2016, apples: 820, bananas: 560, cherries: 720, grapes: 400 }
];

export const longData = [
	{ year: 2019, basket: 1, fruit: 'apples', value: 3840 },
	{ year: 2019, basket: 1, fruit: 'bananas', value: 1920 },
	{ year: 2019, basket: 2, fruit: 'cherries', value: 960 },
	{ year: 2019, basket: 2, fruit: 'grapes', value: 400 },

	{ year: 2018, basket: 1, fruit: 'apples', value: 1600 },
	{ year: 2018, basket: 1, fruit: 'bananas', value: 1440 },
	{ year: 2018, basket: 2, fruit: 'cherries', value: 960 },
	{ year: 2018, basket: 2, fruit: 'grapes', value: 400 },

	{ year: 2017, basket: 1, fruit: 'apples', value: 820 },
	{ year: 2017, basket: 1, fruit: 'bananas', value: 1000 },
	{ year: 2017, basket: 2, fruit: 'cherries', value: 640 },
	{ year: 2017, basket: 2, fruit: 'grapes', value: 400 },

	{ year: 2016, basket: 1, fruit: 'apples', value: 820 },
	{ year: 2016, basket: 1, fruit: 'bananas', value: 560 },
	{ year: 2016, basket: 2, fruit: 'cherries', value: 720 },
	{ year: 2016, basket: 2, fruit: 'grapes', value: 400 }
];

export function getPhyllotaxis({
	radius,
	count,
	width,
	height
}: {
	radius: number;
	count: number;
	width: number;
	height: number;
}) {
	// Phyllotaxis: https://www.youtube.com/watch?v=KWoJgHFYWxY
	const rads = Math.PI * (3 - Math.sqrt(5)); // ~2.4 rads or ~137.5 degrees
	return getSpiral({ angle: radiansToDegrees(rads), radius, count, width, height });
}

export function getSpiral({
	angle,
	radius,
	count,
	width,
	height
}: {
	angle: number;
	radius: number;
	count: number;
	width: number;
	height: number;
}) {
	return Array.from({ length: count }, (_, i) => {
		const r = radius * Math.sqrt(i);
		const a = degreesToRadians(angle * i);
		return {
			x: width / 2 + r * Math.cos(a),
			y: height / 2 + r * Math.sin(a)
		};
	});
}

interface SineWaveOptions {
	numPoints: number;
	frequency?: number;
	amplitude?: number;
	noiseLevel?: number;
	phase?: number;
	xMin?: number;
	xMax?: number;
}

export function generateSineWave(options: SineWaveOptions) {
	const {
		numPoints,
		frequency = 1,
		amplitude = 1,
		noiseLevel = 0,
		phase = 0,
		xMin = 0,
		xMax = 2 * Math.PI
	} = options;

	if (numPoints <= 0) {
		throw new Error('Number of points must be greater than 0');
	}

	const points: { x: number; y: number }[] = [];
	const xStep = (xMax - xMin) / (numPoints - 1);

	for (let i = 0; i < numPoints; i++) {
		const x = xMin + i * xStep;

		// Generate base sine wave
		const sineValue = amplitude * Math.sin(frequency * x + phase);

		// Add random noise if specified
		const noise = noiseLevel > 0 ? (Math.random() - 0.5) * 2 * noiseLevel : 0;
		const y = sineValue + noise;

		points.push({ x, y });
	}

	return points;
}
