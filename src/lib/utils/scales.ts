import { derived } from 'svelte/store';
import { tweened, spring } from 'svelte/motion';

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

/**
 * Animate d3-scale as domain and/or range are updated using tweened store
 */
export function tweenedScale(scale, tweenedOptions: Parameters<typeof tweened>[1] = {}) {
	const tweenedDomain = tweened(undefined, tweenedOptions);
	const tweenedRange = tweened(undefined, tweenedOptions);

	const tweenedScale = derived([tweenedDomain, tweenedRange], ([domain, range]) => {
		const scaleInstance = scale.domain ? scale : scale(); // support `scaleLinear` or `scaleLinear()` (which could have `.interpolate()` and others set)

		if (domain) {
			scaleInstance.domain(domain);
		}
		if (range) {
			scaleInstance.range(range);
		}

		return scaleInstance;
	});

	return {
		subscribe: tweenedScale.subscribe,
		domain: (values) => tweenedDomain.set(values),
		range: (values) => tweenedRange.set(values)
	};
}

/**
 * Animate d3-scale as domain and/or range are updated using spring store
 */
export function springScale(scale, springOptions: Parameters<typeof spring>[1] = {}) {
	const springDomain = spring(undefined, springOptions);
	const springRange = spring(undefined, springOptions);

	const tweenedScale = derived([springDomain, springRange], ([domain, range]) => {
		const scaleInstance = scale.domain ? scale : scale(); // support `scaleLinear` or `scaleLinear()` (which could have `.interpolate()` and others set)

		if (domain) {
			scaleInstance.domain(domain);
		}
		if (range) {
			scaleInstance.range(range);
		}

		return scaleInstance;
	});

	return {
		subscribe: tweenedScale.subscribe,
		domain: (values) => springDomain.set(values),
		range: (values) => springRange.set(values)
	};
}
