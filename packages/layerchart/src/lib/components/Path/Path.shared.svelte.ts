import type { Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import type { CommonStyleProps, Without } from '$lib/utils/types.js';
import type { MarkerOptions } from '../MarkerWrapper.svelte';

import { interpolatePath } from 'd3-interpolate-path';
import { flattenPathData } from '$lib/utils/path.js';
import {
  createMotion,
  extractTweenConfig,
  type MotionProp,
  type ResolvedMotion,
} from '$lib/utils/motion.svelte.js';
import { getChartContext } from '$lib/contexts/chart.js';
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

  // Path data tween source — the actual `d` attribute / canvas render input.
  // Only allocated when the user opts into a tween via the `motion` prop;
  // otherwise the getter reads `pathData` directly.
  #tweenedState: ReturnType<typeof createMotion<string | null | undefined>> | null = null;

  get tweenedPathData() {
    if (this.#tweenedState) return this.#tweenedState.current;
    return this.#getPathData();
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

    if (extractedTween) {
      const tweenedOptions: ResolvedMotion = {
        type: extractedTween.type,
        options: { interpolate: interpolatePath, ...extractedTween.options },
      };

      const initialResolved = resolvePathData(getPathData());
      const defaultPathData = initialResolved
        ? flattenPathData(
            initialResolved,
            Math.min(this.chartCtx.yScale(0) ?? this.chartCtx.yRange[0], this.chartCtx.yRange[0])
          )
        : '';

      this.#tweenedState = createMotion(defaultPathData, this.#getPathData, tweenedOptions);
    }

    // Re-trigger draw transition when path data changes
    $effect(() => {
      if (!getProps().draw) return;
      // Touch dependency (resolves getter form too)
      void this.#getPathData();
      this.drawKey = Symbol();
    });
  }
}
