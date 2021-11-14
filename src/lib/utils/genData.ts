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
