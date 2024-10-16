import { derived } from 'svelte/store';
import { tweened, spring } from 'svelte/motion';

import { type MotionOptions, motionStore } from '$lib/stores/motionStore.js';
import { scaleBand, type ScaleBand } from 'd3-scale';
import { unique } from '@layerstack/utils/array';

export interface AnyScale<Domain = any, Range = any, Input = Domain, Output = any> {
  (value: Input): Output;
  invert?: (value: Output) => Input;
  domain(): Domain[];
  domain(domain: Iterable<Domain>): this;
  range(): Range[];
  range(range: Iterable<Range>): this;
  bandwidth?: Function;
  ticks?: Function;
  tickFormat?: Function;
  copy(): Function;
}

export type DomainType =
  | (number | string | Date | null | undefined)[]
  // 'null' useful for Brush component
  | null;

/**
 * Implemenation for missing `scaleBand().invert()`
 *
 *  See: https://stackoverflow.com/questions/38633082/d3-getting-invert-value-of-band-scales
 *      https://github.com/d3/d3-scale/pull/64
 *      https://github.com/vega/vega-scale/blob/master/src/scaleBand.js#L118
 *      https://observablehq.com/@d3/ordinal-brushing
 * 			https://github.com/d3/d3-scale/blob/11777dac7d4b0b3e229d658aee3257ea67bd5ffa/src/band.js#L32
 * 			https://gist.github.com/LuisSevillano/d53a1dc529eef518780c6df99613e2fd
 */
export function scaleBandInvert(scale: ScaleBand<any>) {
  const domain = scale.domain();
  const eachBand = scale.step();
  const paddingOuter = eachBand * (scale.paddingOuter?.() ?? scale.padding()); // `scaleBand` uses paddingOuter(), while `scalePoint` uses padding() for outer paddding - https://github.com/d3/d3-scale#point_padding

  return function (value: number) {
    const index = Math.floor((value - paddingOuter / 2) / eachBand);
    return domain[Math.max(0, Math.min(index, domain.length - 1))];
  };
}

export function isScaleBand(scale: AnyScale<any, any>): scale is ScaleBand<any> {
  return typeof scale.bandwidth === 'function';
}

/**
 *  Generic way to invert a scale value, handling scaleBand and continuous scales (linear, time, etc).
 *  Useful to map mouse event location (x,y) to domain value
 */
export function scaleInvert(scale: AnyScale<any, any>, value: number) {
  if (isScaleBand(scale)) {
    return scaleBandInvert(scale)(value);
  } else {
    return scale.invert?.(value);
  }
}

/** Create new copy of scale with domain and range */
export function createScale(
  scale: AnyScale,
  domain: DomainType,
  range: any[] | readonly any[] | Function,
  context?: Record<any, any>
) {
  const scaleCopy = scale.copy() as AnyScale;
  if (domain) {
    scaleCopy.domain(domain);
  }

  if (typeof range === 'function') {
    scaleCopy.range(range(context));
  } else {
    scaleCopy.range(range);
  }
  return scaleCopy;
}

/** Create a `scaleBand()` within another scaleBand()'s bandwidth (typically a x1 of an x0 scale, used for grouping) */
export function groupScaleBand<Domain extends { toString(): string }>(
  scale: ScaleBand<Domain>,
  flatData: any[],
  groupBy: string,
  padding?: { inner?: number; outer?: number }
) {
  //
  const groupKeys = unique(flatData.map((d) => d[groupBy])) as string[];

  let newScale = scaleBand().domain(groupKeys).range([0, scale.bandwidth()]);

  if (padding) {
    if (padding.inner) {
      newScale = newScale.paddingInner(padding.inner);
    }
    if (padding.outer) {
      newScale = newScale.paddingOuter(padding.outer);
    }
  }

  return newScale;
}

/**
 * Animate d3-scale as domain and/or range are updated using tweened store
 */
export function tweenedScale<Domain, Range>(
  scale: any,
  tweenedOptions: Parameters<typeof tweened<any>>[1] = {}
) {
  const tweenedDomain = tweened<Domain>(undefined as Domain, tweenedOptions);
  const tweenedRange = tweened<Range>(undefined as Range, tweenedOptions);

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
    domain: (values: Domain) => tweenedDomain.set(values),
    range: (values: Range) => tweenedRange.set(values),
  };
}

/**
 * Animate d3-scale as domain and/or range are updated using spring store
 */
export function springScale<Domain, Range>(
  scale: AnyScale,
  springOptions: Parameters<typeof spring>[1] = {}
) {
  const domainStore = spring<Domain>(undefined, springOptions);
  const rangeStore = spring<Range>(undefined, springOptions);

  const tweenedScale = derived([domainStore, rangeStore], ([domain, range]) => {
    // @ts-expect-error
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
    domain: (values: Domain) => domainStore.set(values),
    range: (values: Range) => rangeStore.set(values),
  };
}

/**
 * Create a store wrapper around a d3-scale which interpolates the domain and/or range using `tweened()` or `spring()` stores.  Fallbacks to `writable()` store if not interpolating
 */
export function motionScale<Domain, Range>(scale: AnyScale, options: MotionOptions) {
  const domainStore = motionStore<Domain>(undefined as Domain, options);
  const rangeStore = motionStore<Range>(undefined as Range, options);

  const tweenedScale = derived([domainStore, rangeStore], ([domain, range]) => {
    // @ts-expect-error
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
    domain: (values: Domain) => domainStore.set(values),
    range: (values: Range) => rangeStore.set(values),
  };
}
