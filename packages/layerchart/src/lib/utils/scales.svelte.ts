import { unique } from '@layerstack/utils';
import { scaleBand, type ScaleBand } from 'd3-scale';
import {
  motionState,
  type MotionProps,
  type SpringOptions,
  type TweenedOptions,
} from 'layerchart/stores/motionState.svelte.js';
import { Spring, Tween } from 'svelte/motion';
import type { Accessor } from './common.js';

export type AnyScale<
  TInput extends SingleDomainType = any,
  TOutput extends SingleDomainType = any,
  TScaleArgs extends any[] | readonly any[] = any[],
> = {
  (value: TInput): TOutput;
  domain(domain: TInput[] | readonly TInput[]): AnyScale<TInput, TOutput, TScaleArgs>;
  domain(): TInput[];
  range(range: TOutput[] | readonly TOutput[]): AnyScale<TInput, TOutput, TScaleArgs>;
  range(): TOutput[];
  rangeRound?: (range: TOutput[] | readonly TOutput[]) => AnyScale<TInput, TOutput, TScaleArgs>;
  copy: () => AnyScale<TInput, TOutput, TScaleArgs>;
  invert?: (value: TOutput) => TInput;
  invertExtent?: (value: TOutput) => [TInput, TInput];
  bandwidth?: () => number;
  ticks?: (count?: number) => TInput[];
  tickFormat?: (count?: number) => (value: TInput) => string;
  clamp?: (clamp: boolean) => AnyScale<TInput, TOutput, TScaleArgs>;
  interpolate?: (
    interpolate: (a: TOutput, b: TOutput) => (t: number) => TOutput
  ) => AnyScale<TInput, TOutput, TScaleArgs>;
  nice?: (count?: number) => AnyScale<TInput, TOutput, TScaleArgs>;
  interpolator?(interpolator: (t: number) => TOutput): AnyScale<TInput, TOutput, TScaleArgs>;
  interpolator?(): (t: number) => TOutput; // Getter
  thresholds?: () => TInput[];
  quantiles?: () => TInput[];
};

function isAnyScale(scale: any): scale is AnyScale {
  return typeof scale === 'function' && typeof scale.range === 'function';
}

export function getRange(scale: any) {
  if (isAnyScale(scale)) {
    return scale.range();
  }
  console.error("[LayerChart] Your scale doesn't have a `.range` method?");
  return [];
}

export type SingleDomainType = number | string | Date | null | undefined;

export type DomainType =
  | (number | string | Date | null | undefined)[]
  // 'null' useful for Brush component
  | null;

// this may need to become a getter for options so we can reactively update after mount
export function motionScaleState<Domain, Range>(
  scale: AnyScale,
  options: MotionProps & {
    defaultDomain?: Domain;
    defaultRange?: Range;
  }
) {
  const { defaultDomain, defaultRange, ...motionOptions } = options;
  const domain = motionState<Domain>(defaultDomain as Domain, motionOptions);
  const range = motionState<Range>(defaultRange as Range, motionOptions);

  const tweenedScale = $derived.by(() => {
    // @ts-expect-error
    const scaleInstance = scale.domain ? scale : scale(); // support `scaleLinear` or `scaleLinear()` (which could have `.interpolate()` and others set)

    if (domain.current) {
      scaleInstance.domain(domain.current);
    }
    if (range.current) {
      scaleInstance.range(range.current);
    }

    return scaleInstance;
  });

  return {
    get current() {
      return tweenedScale;
    },
    domain: (values: Domain) => domain.set(values),
    range: (values: Range) => range.set(values),
  };
}

/**
 * Implementation for missing `scaleBand().invert()`
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
  const scaleCopy = scale.copy();
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

/**
 * Create a `scaleBand()` within another scaleBand()'s bandwidth
 * (typically a x1 of an x0 scale, used for grouping)
 */
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
export function tweenedScale<Domain, Range>(scale: any, tweenedOptions: TweenedOptions = {}) {
  const tweenedDomain = new Tween<Domain>(undefined as Domain, tweenedOptions);
  const tweenedRange = new Tween<Range>(undefined as Range, tweenedOptions);

  const tweenedScale = $derived.by(() => {
    const scaledInstance = scale.domain ? scale : scale();
    if (tweenedDomain.current) {
      scaledInstance.domain(tweenedDomain.current);
    }
    if (tweenedRange.current) {
      scaledInstance.range(tweenedRange.current);
    }
    return scaledInstance;
  });

  return {
    get current() {
      return tweenedScale;
    },
    domain: (values: Domain) => tweenedDomain.set(values),
    range: (values: Range) => tweenedRange.set(values),
  };
}

/**
 * Animate d3-scale as domain and/or range are updated using spring store
 */
export function springScale<Domain, Range>(scale: AnyScale, springOptions: SpringOptions = {}) {
  const domainState = new Spring<Domain>(undefined as Domain, springOptions);
  const rangeState = new Spring<Range>(undefined as Range, springOptions);

  const sprungScale = $derived.by(() => {
    // @ts-expect-error - TODO: investigate/fix
    const scaledInstance = scale.domain ? scale : scale();

    if (domainState.current) {
      scaledInstance.domain(domainState.current);
    }
    if (rangeState.current) {
      scaledInstance.range(rangeState.current);
    }

    return scaledInstance;
  });

  return {
    get current() {
      return sprungScale;
    },
    domain: (values: Domain) => domainState.set(values),
    range: (values: Range) => rangeState.set(values),
  };
}

/**
 * Create a store wrapper around a d3-scale which interpolates the domain and/or range using `tweened()` or `spring()` stores.  Fallbacks to `writable()` store if not interpolating
 */
export function motionScale<Domain, Range>(scale: AnyScale, options: MotionProps) {
  const domainState = motionState<Domain>(undefined as Domain, options);
  const rangeState = motionState<Range>(undefined as Range, options);

  const tweenedScale = $derived.by(() => {
    // @ts-expect-error
    const scaleInstance = scale.domain ? scale : scale(); // support `scaleLinear` or `scaleLinear()` (which could have `.interpolate()` and others set)
    if (domainState.current) {
      scaleInstance.domain(domainState.current);
    }

    if (rangeState.current) {
      scaleInstance.range(rangeState.current);
    }
    return scaleInstance;
  });

  return {
    get current() {
      return tweenedScale;
    },
    domain: (values: Domain) => domainState.set(values),
    range: (values: Range) => rangeState.set(values),
  };
}

function canBeZero(val: unknown) {
  if (val === 0) return true;
  return val;
}

export function makeAccessor<TData>(acc: Accessor<TData>): (d: TData) => any {
  if (!canBeZero(acc)) return null as unknown as (d: TData) => any;
  if (Array.isArray(acc)) {
    return (d: TData) =>
      acc.map((k) => {
        // @ts-expect-error - TODO: Fix these types
        return typeof k !== 'function' ? d[k] : k(d);
      });
  } else if (typeof acc !== 'function') {
    // @ts-expect-error - TODO: Fix these types
    return (d: TData) => d[acc];
  }
  return acc;
}
