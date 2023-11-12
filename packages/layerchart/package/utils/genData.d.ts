/**
 * Get random number between min (inclusive) and max (exclusive)
 *   see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_number_between_0_inclusive_and_1_exclusive
 */
export declare function getRandomNumber(min: number, max: number): number;
/**
 * Get random integer between min (inclusive) and max (inclusive by default)
 *   see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values_inclusive
 */
export declare function getRandomInteger(min: number, max: number, includeMax?: boolean): number;
export declare function createDateSeries(options: {
    count?: number;
    min: number;
    max: number;
    keys: Array<string>;
    value: 'number' | 'integer';
}): {
    date: Date;
}[];
export declare function createTimeSeries(options: {
    count?: number;
    min: number;
    max: number;
    keys: Array<string>;
    value: 'number' | 'integer';
}): {
    name: string;
    startDate: Date;
    endDate: Date;
}[];
export declare const wideData: {
    year: string;
    apples: number;
    bananas: number;
    cherries: number;
    dates: number;
}[];
export declare const longData: {
    year: string;
    basket: number;
    fruit: string;
    value: number;
}[];
export declare function getPhyllotaxis({ radius, count, width, height }: {
    radius: any;
    count: any;
    width: any;
    height: any;
}): {
    x: number;
    y: number;
}[];
export declare function getSpiral({ angle, radius, count, width, height }: {
    angle: any;
    radius: any;
    count: any;
    width: any;
    height: any;
}): {
    x: number;
    y: number;
}[];
