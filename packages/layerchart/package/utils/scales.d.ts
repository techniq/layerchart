import { tweened, spring } from 'svelte/motion';
import { type MotionOptions } from '../stores/motionStore';
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
export declare function scaleBandInvert(scale: any): (value: any) => any;
export declare function isScaleBand(scale: any): boolean;
/**
 *  Generic way to invert a scale value, handling scaleBand and continuous scales (linear, time, etc).
 *  Useful to map mouse event location (x,y) to domain value
 */
export declare function scaleInvert(scale: any, value: number): any;
/**
 * Animate d3-scale as domain and/or range are updated using tweened store
 */
export declare function tweenedScale(scale: any, tweenedOptions?: Parameters<typeof tweened>[1]): {
    subscribe: (this: void, run: import("svelte/store").Subscriber<any>, invalidate?: ((value?: any) => void) | undefined) => import("svelte/store").Unsubscriber;
    domain: (values: any) => Promise<void>;
    range: (values: any) => Promise<void>;
};
/**
 * Animate d3-scale as domain and/or range are updated using spring store
 */
export declare function springScale(scale: any, springOptions?: Parameters<typeof spring>[1]): {
    subscribe: (this: void, run: import("svelte/store").Subscriber<any>, invalidate?: ((value?: any) => void) | undefined) => import("svelte/store").Unsubscriber;
    domain: (values: any) => Promise<void>;
    range: (values: any) => Promise<void>;
};
/**
 * Create a store wrapper around a d3-scale which interpolates the domain and/or range using `tweened()` or `spring()` stores.  Fallbacks to `writable()` store if not interpolating
 */
export declare function motionScale(scale: any, options: MotionOptions): {
    subscribe: (this: void, run: import("svelte/store").Subscriber<any>, invalidate?: ((value?: any) => void) | undefined) => import("svelte/store").Unsubscriber;
    domain: (values: any) => void | Promise<void>;
    range: (values: any) => void | Promise<void>;
};
