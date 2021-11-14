/**
 * Implemenation for missing `scaleBand().invert()`
 *
 *  See: https://stackoverflow.com/a/50846323/191902
 *      https://github.com/d3/d3-scale/pull/64
 *      https://github.com/vega/vega-scale/blob/master/src/scaleBand.js#L118
 *      https://observablehq.com/@d3/ordinal-brushing
 */
export function scaleBandInvert(scale) {
	const domain = scale.domain();
	const paddingOuter = scale(domain[0]);
	const eachBand = scale.step();

	return function (value) {
		// TODO: Should this use Math.round to better select? https://stackoverflow.com/questions/38633082/d3-getting-invert-value-of-band-scales/50846323#comment104743795_50846323
		const index = Math.floor((value - paddingOuter) / eachBand);
		return domain[Math.max(0, Math.min(index, domain.length - 1))];
	};
}

export function isScaleBand(scale) {
	return typeof scale.bandwidth === 'function';
}
