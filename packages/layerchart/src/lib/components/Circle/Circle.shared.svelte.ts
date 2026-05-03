import type { Snippet } from 'svelte';
import { untrack } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';

import type { Without } from '$lib/utils/types.js';
import type { DataProp, DataDrivenStyleProps } from '$lib/utils/dataProp.js';
import {
  hasAnyDataProp,
  resolveDataProp,
  resolveGeoDataPair,
} from '$lib/utils/dataProp.js';
import { chartDataArray } from '$lib/utils/common.js';
import { parseDashArray } from '$lib/utils/path.js';
import { createMotion, createDataMotionMap, type MotionProp } from '$lib/utils/motion.svelte.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { getGeoContext } from '$lib/contexts/geo.js';
import type { ChartState } from '$lib/states/chart.svelte.js';
import type { GeoState } from '$lib/states/geo.svelte.js';

export type CirclePropsWithoutHTML = {
  /**
   * The center x position of the circle.
   * - `number`: pixel value (direct)
   * - `string`: data property name, resolved via xScale
   * - `function(d)`: accessor called per data item, result passed through xScale
   *
   * @default 0
   */
  cx?: DataProp;

  /**
   * The initial center x position of the circle (pixel mode only).
   *
   * @default cx
   */
  initialCx?: number;

  /**
   * The center y position of the circle.
   * - `number`: pixel value (direct)
   * - `string`: data property name, resolved via yScale
   * - `function(d)`: accessor called per data item, result passed through yScale
   *
   * @default 0
   */
  cy?: DataProp;

  /**
   * The initial center y position of the circle (pixel mode only).
   *
   * @default cy
   */
  initialCy?: number;

  /**
   * The radius of the circle.
   * - `number`: pixel value (direct)
   * - `string`: data property name, resolved via rScale
   * - `function(d)`: accessor called per data item, result passed through rScale
   *
   * @default 1
   */
  r?: DataProp;

  /**
   * The initial radius of the circle (pixel mode only).
   *
   * @default r
   */
  initialR?: number;

  /**
   * Data array to iterate over in data mode.
   * Falls back to chart context data when not provided.
   */
  data?: any[];

  /**
   * Key function for keyed {#each} rendering in data mode.
   *
   * @default (d, i) => i
   */
  key?: (d: any, index: number) => any;

  /**
   * A bindable reference to the `<circle>` element (pixel mode only).
   *
   * @bindable
   */
  ref?: SVGCircleElement;

  /** Motion configuration (pixel mode only). */
  motion?: MotionProp;

  /**
   * Dashed-border pattern. Accepts a number (single dash length), a
   * `[dash, gap, ...]` array, or a string (same syntax as SVG
   * `stroke-dasharray`). HTML layer approximates via `border-style: dashed`.
   */
  dashArray?: number | number[] | string;

  /** Children content to render.  Note: Only works for Html layers */
  children?: Snippet;
} & DataDrivenStyleProps;

export type CircleProps = CirclePropsWithoutHTML &
  Without<SVGAttributes<Element>, CirclePropsWithoutHTML>;

const defaultKey = (_: any, i: number) => i;

/**
 * Resolve the cx/cy/r values for a single data item, going through
 * either the geo projection or the chart's x/y/r scales.
 */
export function resolveCircle(
  d: any,
  props: { cx?: DataProp; cy?: DataProp; r?: DataProp },
  chartCtx: ChartState,
  geo: GeoState
): { cx: number; cy: number; r: number } {
  // When cx/cy/r are omitted, fall back to the chart's accessors
  // (xGet/yGet/rGet) — same pattern as `Points`. Hardcoded defaults
  // (0/0/1) only apply when neither prop nor chart-level config is set.
  const cxDefault =
    typeof props.cx === 'number'
      ? props.cx
      : props.cx == null && chartCtx.config.x != null
        ? Number(chartCtx.xGet(d)) || 0
        : 0;
  const cyDefault =
    typeof props.cy === 'number'
      ? props.cy
      : props.cy == null && chartCtx.config.y != null
        ? Number(chartCtx.yGet(d)) || 0
        : 0;
  const rDefault =
    typeof props.r === 'number'
      ? props.r
      : props.r == null && chartCtx.config.r != null
        ? Number(chartCtx.rGet(d)) || 1
        : 1;

  if (geo.projection) {
    const [projX, projY] = resolveGeoDataPair(props.cx, props.cy, d, geo.projection);
    return {
      cx: projX,
      cy: projY,
      r: resolveDataProp(props.r, d, chartCtx.rScale, rDefault),
    };
  }
  return {
    cx: resolveDataProp(props.cx, d, chartCtx.xScale, cxDefault),
    cy: resolveDataProp(props.cy, d, chartCtx.yScale, cyDefault),
    r: resolveDataProp(props.r, d, chartCtx.rScale, rDefault),
  };
}

/**
 * Reactive state shared by every per-layer Circle variant. Instantiate from
 * each `Circle.svg.svelte` / `Circle.canvas.svelte` / `Circle.html.svelte`
 * component setup, passing a getter for the props. Exposes the derived
 * computations + motion sources every layer needs.
 *
 * Per-layer specific bits (e.g. SVG's `bind:this` ref, HTML's
 * `staticBorderWidth`, canvas's `render` function and canvas registration)
 * stay in their respective `.svelte` files.
 */
export class CircleState {
  // Default initializer so derived class fields below can safely call this
  // before the constructor body sets the real getter.
  #getProps: () => CircleProps = () => ({}) as CircleProps;

  // Contexts (must be read inside a Svelte component setup, which is where
  // CircleState is instantiated).
  chartCtx = getChartContext();
  geo = getGeoContext();

  // Reactive derivations
  dashArrayResolved = $derived(parseDashArray(this.#getProps().dashArray));
  dashArrayAttr = $derived(
    this.dashArrayResolved ? this.dashArrayResolved.join(' ') : undefined
  );
  dataMode = $derived(
    this.#getProps().data != null ||
      hasAnyDataProp(this.#getProps().cx, this.#getProps().cy, this.#getProps().r)
  );
  #resolvedData: any[] = $derived(
    this.dataMode ? (this.#getProps().data ?? chartDataArray(this.chartCtx.data)) : []
  );

  // Per-key motion tracking (only created when motion is configured)
  #dataMotionMap: ReturnType<typeof createDataMotionMap> = null;

  resolvedItems = $derived.by(() => {
    if (!this.dataMode) return [];
    const props = this.#getProps();
    const keyFn = props.key ?? defaultKey;
    return this.#resolvedData.map((d, i) => {
      const key = keyFn(d, i);
      const resolved = resolveCircle(d, props, this.chartCtx, this.geo);
      const animated = this.#dataMotionMap?.get(key);
      return {
        d,
        key,
        cx: animated?.cx ?? resolved.cx,
        cy: animated?.cy ?? resolved.cy,
        r: animated?.r ?? resolved.r,
      };
    });
  });

  // Pixel-mode motion sources. Initial values are captured at construction;
  // subsequent updates come from the prop getters.
  #motionCx!: ReturnType<typeof createMotion<number>>;
  #motionCy!: ReturnType<typeof createMotion<number>>;
  #motionR!: ReturnType<typeof createMotion<number>>;

  // Static (non-data-driven) values used by SVG/HTML branches in pixel mode.
  staticFill = $derived(
    typeof this.#getProps().fill === 'string' ? (this.#getProps().fill as string) : undefined
  );
  staticFillOpacity = $derived(
    typeof this.#getProps().fillOpacity === 'number'
      ? (this.#getProps().fillOpacity as number)
      : undefined
  );
  staticStroke = $derived(
    typeof this.#getProps().stroke === 'string' ? (this.#getProps().stroke as string) : undefined
  );
  staticStrokeWidth = $derived(
    typeof this.#getProps().strokeWidth === 'number'
      ? (this.#getProps().strokeWidth as number)
      : undefined
  );
  staticOpacity = $derived(
    typeof this.#getProps().opacity === 'number'
      ? (this.#getProps().opacity as number)
      : undefined
  );
  staticClassName = $derived(
    typeof this.#getProps().class === 'string' ? (this.#getProps().class as string) : undefined
  );

  constructor(getProps: () => CircleProps) {
    this.#getProps = getProps;

    const initial = getProps();
    const initialCx =
      initial.initialCx ?? (typeof initial.cx === 'number' ? initial.cx : 0);
    const initialCy =
      initial.initialCy ?? (typeof initial.cy === 'number' ? initial.cy : 0);
    const initialR =
      initial.initialR ?? (typeof initial.r === 'number' ? initial.r : 1);

    this.#motionCx = createMotion(
      initialCx,
      () => (typeof getProps().cx === 'number' ? (getProps().cx as number) : 0),
      initial.motion
    );
    this.#motionCy = createMotion(
      initialCy,
      () => (typeof getProps().cy === 'number' ? (getProps().cy as number) : 0),
      initial.motion
    );
    this.#motionR = createMotion(
      initialR,
      () => (typeof getProps().r === 'number' ? (getProps().r as number) : 1),
      initial.motion
    );

    this.#dataMotionMap = createDataMotionMap(initial.motion);
    if (this.#dataMotionMap) {
      const motionMap = this.#dataMotionMap;
      $effect(() => {
        if (!this.dataMode) return;
        const props = getProps();
        const keyFn = props.key ?? defaultKey;
        const activeKeys = new Set<any>();
        for (let i = 0; i < this.#resolvedData.length; i++) {
          const d = this.#resolvedData[i];
          const key = keyFn(d, i);
          activeKeys.add(key);
          const resolved = resolveCircle(d, props, this.chartCtx, this.geo);
          untrack(() => motionMap.update(key, resolved));
        }
        untrack(() => motionMap.cleanup(activeKeys));
      });
    }
  }

  get motionCx() {
    return this.#motionCx.current;
  }
  get motionCy() {
    return this.#motionCy.current;
  }
  get motionR() {
    return this.#motionR.current;
  }
}

/** Build the standard `markInfo` payload used by every Circle variant. */
export function circleMarkInfo(props: CircleProps, dataMode: boolean) {
  if (!dataMode) return {};
  return {
    data: props.data,
    x: typeof props.cx === 'string' ? props.cx : undefined,
    y: typeof props.cy === 'string' ? props.cy : undefined,
    color: typeof props.fill === 'string' ? props.fill : undefined,
  };
}
