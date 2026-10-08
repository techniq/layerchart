import type { Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import type { CommonStyleProps, Without } from '$lib/utils/types.js';
import type { MarkerOptions } from '../MarkerWrapper.svelte';

import { interpolatePath } from 'd3-interpolate-path';
import { flattenPathData } from '$lib/utils/path.js';
import {
  createMotion,
  extractTweenConfig,
  parseMotionProp,
  type MotionProp,
  type ResolvedMotion,
} from '$lib/utils/motion.svelte.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { getLayerIsometric } from '$lib/contexts/isometric.js';
import type { ChartState } from '$lib/states/chart.svelte.js';

import type { draw as _drawTransition } from 'svelte/transition';

export type PathPropsWithoutHTML = {
  /**
   * The `d` attribute of the rendered `<path>`.
   *
   * Accepts either a value (resolved at call site) or a function that
   * returns the current value. Passing a function lets the parent avoid
   * re-rendering its own template on every change to the path data —
   * useful when a parent like `Link` / `Spline` / `Area` updates the
   * path on every animation tick across hundreds of instances.
   */
  pathData?: string | undefined | null | (() => string | undefined | null);

  /**
   * Whether to animate the drawing of the path over time.
   * Pass either `true` or an object with transition options to
   * enable the transition.
   *
   * Works best with `tweened` disabled.
   */
  draw?: boolean | Parameters<typeof _drawTransition>[1];

  /** Marker to attach to both start and end points of the line */
  marker?: MarkerOptions;

  /** Marker to attach to the middle point of the line */
  markerMid?: MarkerOptions;

  /** Marker to attach to the start point of the line */
  markerStart?: MarkerOptions;

  /** Marker to attach to the end point of the line */
  markerEnd?: MarkerOptions;

  /**
   * Add additional content at the start of the line.
   * Receives `{ point: DOMPoint; value: { x: number; y: number } }` as a snippet prop.
   */
  startContent?: Snippet<[{ point: DOMPoint; value: { x: number; y: number } }]>;

  /**
   * Add additional content at the end of the line.
   * Receives `{ point: DOMPoint; value: { x: number; y: number } }` as a snippet prop.
   */
  endContent?: Snippet<[{ point: DOMPoint; value: { x: number; y: number } }]>;

  /**
   * A reference to the `<path>` element.
   *
   * @bindable
   */
  pathRef?: SVGPathElement;

  motion?: MotionProp;

  /**
   * On an `isometric` chart, stand the shape up `z` pixels, or between `[start, end]`, with shaded
   * sides.  An unfilled path is only raised.
   */
  z?: number | [start: number, end: number];
} & CommonStyleProps;

export type PathProps = PathPropsWithoutHTML &
  Without<SVGAttributes<SVGPathElement>, PathPropsWithoutHTML>;

/** Resolve `pathData` whether it was passed as a value or a getter function. */
function resolvePathData(v: PathProps['pathData']): string | null | undefined {
  return typeof v === 'function' ? v() : v;
}

/**
 * Reactive state shared by every per-layer Path variant.
 */
export class PathState {
  // Hot-path getter: reads only `pathData` (or invokes the function-getter form).
  // Kept separate from the full-props getter so that the `<path d=...>` template
  // updater does not subscribe to every Path prop on every read — critical for
  // mark-heavy scenes (force-simulation graphs with hundreds of links updating
  // per tick) where pre-fix each tween read re-evaluated all 15+ props.
  #getPathData: () => string | null | undefined;

  // Contexts
  chartCtx: ChartState = getChartContext();

  // Path data tween source — the actual `d` attribute / canvas render input
  #tweenedState!: ReturnType<typeof createMotion<string | null | undefined>>;

  get tweenedPathData() {
    return this.#tweenedState.current;
  }

  // Re-key trigger for draw transitions
  drawKey = $state(Symbol());

  /**
   * @param getPathData  Hot-path getter — reads only `pathData`. Kept separate from
   *                     `getProps` so the `<path d=...>` updater (and the canvas
   *                     `tweenedPathData` consumer) does not subscribe to every
   *                     Path prop on every tick.
   * @param getProps     Full-props getter — used for one-time / cold-path config
   *                     (motion, draw).
   */
  constructor(
    getPathData: () => PathProps['pathData'],
    getProps: () => PathProps = () => ({}) as PathProps
  ) {
    this.#getPathData = () => resolvePathData(getPathData());
    const initial = getProps();
    const extractedTween = extractTweenConfig(initial.motion);
    const tweenedOptions: ResolvedMotion | undefined = extractedTween
      ? {
          type: extractedTween.type,
          options: { interpolate: interpolatePath, ...extractedTween.options },
        }
      : undefined;

    // Provide initial `0` baseline; only set on initial mount
    const defaultPathData = (() => {
      if (!tweenedOptions) {
        // Fast initial render when not tweened
        return '';
      }
      const resolved = resolvePathData(getPathData());
      // A geo path starts as itself rather than rising from a baseline
      if (resolved && this.chartCtx.geoState?.projection) return resolved;
      if (resolved) {
        return flattenPathData(
          resolved,
          Math.min(this.chartCtx.yScale(0) ?? this.chartCtx.yRange[0], this.chartCtx.yRange[0])
        );
      }
      return '';
    })();

    this.#tweenedState = createMotion(defaultPathData, this.#getPathData, tweenedOptions);

    // Re-trigger draw transition when path data changes
    $effect(() => {
      if (!getProps().draw) return;
      // Touch dependency (resolves getter form too)
      void this.#getPathData();
      this.drawKey = Symbol();
    });
  }
}

/**
 * A path stood up off an `isometric` floor by its `z`: the sides facing the viewer, and the shift
 * raising its top.  Kept apart from `PathState` so a flat path pays nothing for it.
 */
export class PathExtrusion {
  #chartCtx = getChartContext();
  #layerIsometric = getLayerIsometric();
  #getProps: () => Pick<PathProps, 'z' | 'fill'>;
  #getPathData: () => string;
  #motionZ: ReturnType<typeof createMotion<[number, number]>>;

  /** The shape's top offset and sides (see `extrudePath`), or `null` when it lies flat */
  raised = $derived.by(() => {
    const { z, fill } = this.#getProps();
    if (z == null) return null;
    const m = this.#layerIsometric();
    const lift = this.#chartCtx.isometricLift;
    if (!m || !lift || (lift.x === 0 && lift.y === 0)) return null;
    return this.#chartCtx.isometric!.extrudePath(
      this.#getPathData(),
      this.#motionZ.current,
      lift,
      m,
      fill !== 'none'
    );
  });

  /**
   * @param getPathData  The path as drawn (tweened, if it is)
   * @param getProps     Its `z` and `fill`
   * @param motion       Eases a change of `z`, like the path
   */
  constructor(
    getPathData: () => string,
    getProps: () => Pick<PathProps, 'z' | 'fill'>,
    motion?: MotionProp
  ) {
    this.#getPathData = getPathData;
    this.#getProps = getProps;
    // `z` as `[start, end]`
    const heights = (): [number, number] => {
      const z = this.#getProps().z;
      return Array.isArray(z) ? z : [0, z ?? 0];
    };
    this.#motionZ = createMotion(
      heights(),
      heights,
      motion === undefined ? undefined : parseMotionProp(motion)
    );
  }

  /** `transform` raised by the shift, for the top */
  transform(transform?: string) {
    const shift = this.raised?.shift;
    if (!shift) return transform;
    return `translate(${shift.x},${shift.y})${transform ? ` ${transform}` : ''}`;
  }
}
