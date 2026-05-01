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
import type { MarkerOptions } from '../MarkerWrapper.svelte';

export type LinePropsWithoutHTML = {
  /**
   * The x-coordinate of the line's starting point.
   * - `number`: pixel value (direct)
   * - `string`: data property name, resolved via xScale
   * - `function(d)`: accessor called per data item, result passed through xScale
   *
   * @required
   */
  x1: DataProp;

  /** The initial x-coordinate of the line's starting point (pixel mode only). @default x1 */
  initialX1?: number;

  /**
   * The y-coordinate of the line's starting point.
   * - `number`: pixel value (direct)
   * - `string`: data property name, resolved via yScale
   * - `function(d)`: accessor called per data item, result passed through yScale
   *
   * @required
   */
  y1: DataProp;

  /** The initial y-coordinate of the line's starting point (pixel mode only). @default y1 */
  initialY1?: number;

  /**
   * The x-coordinate of the line's ending point.
   * - `number`: pixel value (direct)
   * - `string`: data property name, resolved via xScale
   * - `function(d)`: accessor called per data item, result passed through xScale
   *
   * @required
   */
  x2: DataProp;

  /** The initial x-coordinate of the line's ending point (pixel mode only). @default x2 */
  initialX2?: number;

  /**
   * The y-coordinate of the line's ending point.
   * - `number`: pixel value (direct)
   * - `string`: data property name, resolved via yScale
   * - `function(d)`: accessor called per data item, result passed through yScale
   *
   * @default y2
   */
  y2: DataProp;

  /** The initial y-coordinate of the line's ending point (pixel mode only). @default y2 */
  initialY2?: number;

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

  /** Marker to attach to both start and end points of the line */
  marker?: MarkerOptions;

  /** Marker to attach to the start point of the line */
  markerStart?: MarkerOptions;

  /** Marker to attach to the mid point of the line */
  markerMid?: MarkerOptions;

  /** Marker to attach to the end point of the line */
  markerEnd?: MarkerOptions;

  /** Motion configuration (pixel mode only). */
  motion?: MotionProp;

  /**
   * Dashed-line pattern. Accepts a number (single dash length), a
   * `[dash, gap, ...]` array, or a string (same syntax as SVG
   * `stroke-dasharray`). Works across `<Svg>`, `<Canvas>`, and `<Html>`
   * layers — HTML approximates the pattern via `repeating-linear-gradient`.
   */
  dashArray?: number | number[] | string;
} & DataDrivenStyleProps;

export type LineProps = LinePropsWithoutHTML &
  Without<SVGAttributes<SVGPathElement>, LinePropsWithoutHTML>;

const defaultKey = (_: any, i: number) => i;

/** Build the standard `markInfo` payload used by every Line variant. */
export function lineMarkInfo(props: LineProps, dataMode: boolean) {
  if (!dataMode) return {};
  return {
    data: props.data,
    x:
      typeof props.x1 === 'string'
        ? props.x1
        : typeof props.x2 === 'string'
          ? props.x2
          : undefined,
    y:
      typeof props.y1 === 'string'
        ? props.y1
        : typeof props.y2 === 'string'
          ? props.y2
          : undefined,
    color:
      typeof props.stroke === 'string'
        ? props.stroke
        : typeof props.fill === 'string'
          ? props.fill
          : undefined,
  };
}

/**
 * Reactive state shared by every per-layer Line variant.
 */
export class LineState {
  #getProps: () => LineProps = () => ({}) as LineProps;

  // Contexts
  chartCtx: ChartState = getChartContext();
  geo: GeoState = getGeoContext();

  // Data mode detection
  dataMode = $derived(
    hasAnyDataProp(
      this.#getProps().x1,
      this.#getProps().y1,
      this.#getProps().x2,
      this.#getProps().y2
    )
  );

  #resolvedData: any[] = $derived(
    this.dataMode ? (this.#getProps().data ?? chartDataArray(this.chartCtx.data)) : []
  );

  resolvedItems = $derived.by(() => {
    if (!this.dataMode) return [];
    const props = this.#getProps();
    const keyFn = props.key ?? defaultKey;
    return this.#resolvedData.map((d, i) => {
      const key = keyFn(d, i);
      const resolved = this.#resolveLine(d);
      const animated = this.#dataMotionMap?.get(key);
      return {
        d,
        key,
        x1: animated?.x1 ?? resolved.x1,
        y1: animated?.y1 ?? resolved.y1,
        x2: animated?.x2 ?? resolved.x2,
        y2: animated?.y2 ?? resolved.y2,
      };
    });
  });

  #resolveLine(d: any): { x1: number; y1: number; x2: number; y2: number } {
    const props = this.#getProps();
    if (this.geo.projection) {
      const [projX1, projY1] = resolveGeoDataPair(props.x1, props.y1, d, this.geo.projection);
      const [projX2, projY2] = resolveGeoDataPair(props.x2, props.y2, d, this.geo.projection);
      return { x1: projX1, y1: projY1, x2: projX2, y2: projY2 };
    }
    return {
      x1: resolveDataProp(props.x1, d, this.chartCtx.xScale, 0),
      y1: resolveDataProp(props.y1, d, this.chartCtx.yScale, 0),
      x2: resolveDataProp(props.x2, d, this.chartCtx.xScale, 0),
      y2: resolveDataProp(props.y2, d, this.chartCtx.yScale, 0),
    };
  }

  // Dash array
  dashArrayResolved = $derived(parseDashArray(this.#getProps().dashArray));
  dashArrayAttr = $derived(this.dashArrayResolved ? this.dashArrayResolved.join(' ') : undefined);

  // Pixel-mode motion sources
  #dataMotionMap: ReturnType<typeof createDataMotionMap> = null;
  #motionX1!: ReturnType<typeof createMotion<number>>;
  #motionY1!: ReturnType<typeof createMotion<number>>;
  #motionX2!: ReturnType<typeof createMotion<number>>;
  #motionY2!: ReturnType<typeof createMotion<number>>;

  get motionX1() {
    return this.#motionX1.current;
  }
  get motionY1() {
    return this.#motionY1.current;
  }
  get motionX2() {
    return this.#motionX2.current;
  }
  get motionY2() {
    return this.#motionY2.current;
  }

  // Static (non-data-driven) values for SVG/HTML pixel mode
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
  // For HTML rendering: stroke-width fallback as div height
  staticHeight = $derived(
    typeof this.#getProps().strokeWidth === 'number'
      ? `${this.#getProps().strokeWidth}px`
      : '1px'
  );

  constructor(getProps: () => LineProps) {
    this.#getProps = getProps;

    const initial = getProps();
    const initialX1 = initial.initialX1 ?? (typeof initial.x1 === 'number' ? initial.x1 : 0);
    const initialY1 = initial.initialY1 ?? (typeof initial.y1 === 'number' ? initial.y1 : 0);
    const initialX2 = initial.initialX2 ?? (typeof initial.x2 === 'number' ? initial.x2 : 0);
    const initialY2 = initial.initialY2 ?? (typeof initial.y2 === 'number' ? initial.y2 : 0);

    this.#motionX1 = createMotion(
      initialX1,
      () => (typeof getProps().x1 === 'number' ? (getProps().x1 as number) : 0),
      initial.motion
    );
    this.#motionY1 = createMotion(
      initialY1,
      () => (typeof getProps().y1 === 'number' ? (getProps().y1 as number) : 0),
      initial.motion
    );
    this.#motionX2 = createMotion(
      initialX2,
      () => (typeof getProps().x2 === 'number' ? (getProps().x2 as number) : 0),
      initial.motion
    );
    this.#motionY2 = createMotion(
      initialY2,
      () => (typeof getProps().y2 === 'number' ? (getProps().y2 as number) : 0),
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
          const resolved = this.#resolveLine(d);
          untrack(() => motionMap.update(key, resolved));
        }
        untrack(() => motionMap.cleanup(activeKeys));
      });
    }
  }
}
