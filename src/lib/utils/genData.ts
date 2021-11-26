import { subDays } from 'date-fns';

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
	value: 'number' | 'integer';
	fields: Array<string>;
}) {
	const now = new Date();

	const count = options.count ?? 10;
	const min = options.min;
	const max = options.max;
	const fields = options.fields ?? ['value'];

	return Array.from({ length: count }).map((_, i) => {
		return {
			date: subDays(now, count - i - 1),
			...Object.fromEntries(
				fields.map((field) => {
					return [
						field,
						options.value === 'integer' ? getRandomInteger(min, max) : getRandomNumber(min, max)
					];
				})
			)
		};
	});
}
