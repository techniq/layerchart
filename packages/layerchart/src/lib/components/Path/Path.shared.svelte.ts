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
   * Pass `<path d={...} />` explicitly instead of calculating
   * from data / context
   */
  pathData?: string | undefined | null;

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

/**
 * Reactive state shared by every per-layer Path variant.
 */
export class PathState {
  #getProps: () => PathProps = () => ({}) as PathProps;

  // Contexts
  chartCtx: ChartState = getChartContext();

  // Path data tween source — the actual `d` attribute / canvas render input.
  // Only allocated when the user opts into a tween via the `motion` prop;
  // otherwise the getter reads `pathData` directly.
  #tweenedState: ReturnType<typeof createMotion<string | null | undefined>> | null = null;

  get tweenedPathData() {
    if (this.#tweenedState) return this.#tweenedState.current;
    return this.#getProps().pathData;
  }

  // Re-key trigger for draw transitions
  drawKey = $state(Symbol());

  constructor(getProps: () => PathProps) {
    this.#getProps = getProps;

    const initial = getProps();
    const extractedTween = extractTweenConfig(initial.motion);

    if (extractedTween) {
      const tweenedOptions: ResolvedMotion = {
        type: extractedTween.type,
        options: { interpolate: interpolatePath, ...extractedTween.options },
      };

      const defaultPathData = initial.pathData
        ? flattenPathData(
            initial.pathData,
            Math.min(this.chartCtx.yScale(0) ?? this.chartCtx.yRange[0], this.chartCtx.yRange[0])
          )
        : '';

      this.#tweenedState = createMotion(
        defaultPathData,
        () => getProps().pathData,
        tweenedOptions
      );
    }

    // Re-trigger draw transition when path data changes
    $effect(() => {
      if (!getProps().draw) return;
      // Touch dependency
      void getProps().pathData;
      this.drawKey = Symbol();
    });
  }
}
