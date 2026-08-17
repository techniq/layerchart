import type { Snippet } from 'svelte';
import { untrack } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';

import type { CommonEvents, Without } from '$lib/utils/types.js';
import type { DataProp, DataDrivenStyleProps } from '$lib/utils/dataProp.js';
import { hasAnyDataProp, resolveDataProp, resolveGeoDataPair } from '$lib/utils/dataProp.js';
import {
  resolveCorners,
  cornersUniform,
  resolveInsets,
  type Corners,
  type Insets,
} from '$lib/utils/rect.svelte.js';
import { roundedRectPath, parseDashArray } from '$lib/utils/path.js';
import {
  createMotion,
  createDataMotionMap,
  parseMotionProp,
  type MotionProp,
  type MotionOptions,
} from '$lib/utils/motion.svelte.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { getMarkData } from '$lib/contexts/facet.js';
import { getGeoContext } from '$lib/contexts/geo.js';
import type { ChartState } from '$lib/states/chart.svelte.js';
import type { GeoState } from '$lib/states/geo.svelte.js';

export type RectPropsWithoutHTML = {
  /**
   * The x position of the rectangle.
   * - `number`: pixel value (direct)
   * - `string`: data property name, resolved via xScale
   * - `function(d)`: accessor called per data item, result passed through xScale
   *
   * @default 0
   */
  x?: DataProp;

  /**
   * The initial x position (pixel mode only).
   *
   * @default x
   */
  initialX?: number;

  /**
   * The y position of the rectangle.
   * - `number`: pixel value (direct)
   * - `string`: data property name, resolved via yScale
   * - `function(d)`: accessor called per data item, result passed through yScale
   *
   * @default 0
   */
  y?: DataProp;

  /**
   * The initial y position (pixel mode only).
   *
   * @default y
   */
  initialY?: number;

  /**
   * The width of the rectangle (pixels).
   *
   * @default 0
   */
  width?: DataProp;
  initialWidth?: number;

  /**
   * The height of the rectangle (pixels).
   *
   * @default 0
   */
  height?: DataProp;
  initialHeight?: number;

  /**
   * Left/start x edge (data mode).
   * - `string`: data property name, resolved via xScale
   * - `function(d)`: accessor called per data item, result passed through xScale
   * - `number`: pixel value
   */
  x0?: DataProp;

  /**
   * Right/end x edge (data mode).
   * - `string`: data property name, resolved via xScale
   * - `function(d)`: accessor called per data item, result passed through xScale
   * - `number`: pixel value
   */
  x1?: DataProp;

  /**
   * Top/start y edge (data mode).
   * - `string`: data property name, resolved via yScale
   * - `function(d)`: accessor called per data item, result passed through yScale
   * - `number`: pixel value
   */
  y0?: DataProp;

  /**
   * Bottom/end y edge (data mode).
   * - `string`: data property name, resolved via yScale
   * - `function(d)`: accessor called per data item, result passed through yScale
   * - `number`: pixel value
   */
  y1?: DataProp;

  /**
   * Insets to shrink the rendered rectangle.
   * Supports `all`, `x`, `y`, `left`, `right`, `top`, `bottom`.
   */
  insets?: Insets;

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
   * Underlying `<rect>` (or `<div>` in an html layer) tag. Useful for bindings (pixel mode only).
   * Never set in a canvas layer, which draws the rect rather than creating an element.
   *
   * @bindable
   */
  ref?: SVGRectElement | HTMLDivElement;

  /** Motion configuration (pixel mode only). */
  motion?: MotionProp<'x' | 'y' | 'width' | 'height'>;

  /**
   * Dashed-border pattern. Accepts a number (single dash length), a
   * `[dash, gap, ...]` array, or a string (same syntax as SVG
   * `stroke-dasharray`). HTML layer approximates via `border-style: dashed`.
   */
  dashArray?: number | number[] | string;

  /**
   * Per-corner radii. Accepts a number (all corners equal — same as `rx`),
   * a `[tl, tr, br, bl]` tuple, or `{ topLeft, topRight, bottomRight, bottomLeft }`.
   * Takes precedence over `rx`/`ry` when corners differ.
   */
  corners?: Corners;

  /** Children content to render.  Note: Only works for Html layers */
  children?: Snippet;
} & DataDrivenStyleProps;

export type RectProps = RectPropsWithoutHTML &
  Without<SVGAttributes<SVGRectElement>, RectPropsWithoutHTML> &
  CommonEvents;

const defaultKey = (_: any, i: number) => i;

/** Build the standard `markInfo` payload used by every Rect variant. */
export function rectMarkInfo(props: RectProps, dataMode: boolean) {
  if (!dataMode) return {};
  return {
    data: props.data,
    x: typeof props.x === 'string' ? props.x : undefined,
    y: typeof props.y === 'string' ? props.y : undefined,
    color:
      typeof props.fill === 'string'
        ? props.fill
        : typeof props.stroke === 'string'
          ? props.stroke
          : undefined,
  };
}

/**
 * Reactive state shared by every per-layer Rect variant.
 */
export class RectState {
  #getProps: () => RectProps = () => ({}) as RectProps;

  /**
   * Memoized props. `#getProps()` allocates a fresh object (it spreads `rest`),
   * so calling it once per derived meant ~30 allocations per instance per update.
   */
  #props: RectProps = $derived(this.#getProps());

  // Contexts
  chartCtx: ChartState = getChartContext();
  markData = getMarkData();
  geo: GeoState = getGeoContext();

  // Data mode detection
  hasEdgeProps = $derived(
    hasAnyDataProp(this.#props.x0, this.#props.y0, this.#props.x1, this.#props.y1)
  );
  dataMode = $derived(
    hasAnyDataProp(this.#props.x, this.#props.y, this.#props.width, this.#props.height) ||
      this.hasEdgeProps
  );

  // Data resolution
  #resolvedData: any[] = $derived(this.dataMode ? this.markData(this.#props.data) : []);

  resolvedItems = $derived.by(() => {
    if (!this.dataMode) return [];
    const props = this.#props;
    const keyFn = props.key ?? defaultKey;
    return this.#resolvedData.map((d, i) => {
      const key = keyFn(d, i);
      const resolved = this.#resolveRect(d);
      const animated = this.#dataMotionMap?.get(key);
      return {
        d,
        key,
        x: animated?.x ?? resolved.x,
        y: animated?.y ?? resolved.y,
        width: animated?.width ?? resolved.width,
        height: animated?.height ?? resolved.height,
      };
    });
  });

  #resolveRect(d: any): { x: number; y: number; width: number; height: number } {
    const props = this.#props;
    const resolvedInsets = resolveInsets(props.insets);

    if (this.hasEdgeProps) {
      let rx0: number, rx1p: number, ry0: number, ry1p: number;
      if (this.geo.projection) {
        [rx0, ry0] = resolveGeoDataPair(props.x0, props.y0, d, this.geo.projection);
        [rx1p, ry1p] = resolveGeoDataPair(props.x1, props.y1, d, this.geo.projection);
      } else {
        rx0 = resolveDataProp(props.x0, d, this.chartCtx.xScale, 0);
        rx1p = resolveDataProp(props.x1, d, this.chartCtx.xScale, 0);
        ry0 = resolveDataProp(props.y0, d, this.chartCtx.yScale, 0);
        ry1p = resolveDataProp(props.y1, d, this.chartCtx.yScale, 0);
      }

      const left = Math.min(rx0, rx1p) + resolvedInsets.left;
      const right = Math.max(rx0, rx1p) - resolvedInsets.right;
      const top = Math.min(ry0, ry1p) + resolvedInsets.top;
      const bottom = Math.max(ry0, ry1p) - resolvedInsets.bottom;

      return {
        x: left,
        y: top,
        width: Math.max(0, right - left),
        height: Math.max(0, bottom - top),
      };
    } else {
      let resolvedX: number, resolvedY: number;
      if (this.geo.projection) {
        [resolvedX, resolvedY] = resolveGeoDataPair(props.x, props.y, d, this.geo.projection);
      } else {
        resolvedX = resolveDataProp(props.x, d, this.chartCtx.xScale, 0);
        resolvedY = resolveDataProp(props.y, d, this.chartCtx.yScale, 0);
      }
      return {
        x: resolvedX + resolvedInsets.left,
        y: resolvedY + resolvedInsets.top,
        width: Math.max(
          0,
          resolveDataProp(props.width, d, undefined, 0) - resolvedInsets.left - resolvedInsets.right
        ),
        height: Math.max(
          0,
          resolveDataProp(props.height, d, undefined, 0) -
            resolvedInsets.top -
            resolvedInsets.bottom
        ),
      };
    }
  }

  // Dash array
  dashArrayResolved = $derived(parseDashArray(this.#props.dashArray));
  dashArrayAttr = $derived(this.dashArrayResolved ? this.dashArrayResolved.join(' ') : undefined);

  // Corners
  cornersUniformValue = $derived.by(() => {
    const corners = this.#props.corners;
    if (corners === undefined) return undefined;
    if (typeof corners === 'number') return corners;
    const resolved = resolveCorners(corners, Infinity, Infinity);
    return cornersUniform(resolved) ? resolved[0] : undefined;
  });
  cornersNonUniform = $derived(
    this.#props.corners !== undefined && this.cornersUniformValue === undefined
  );

  // Normalize rx/ry: if only one provided, use for both (SVG behavior)
  rx = $derived(
    Number((this.#props as any).rx ?? (this.#props as any).ry ?? this.cornersUniformValue) || 0
  );
  ry = $derived(
    Number((this.#props as any).ry ?? (this.#props as any).rx ?? this.cornersUniformValue) || 0
  );

  // Pixel-mode motion sources
  #dataMotionMap: ReturnType<typeof createDataMotionMap> = null;
  #motionX!: ReturnType<typeof createMotion<number>>;
  #motionY!: ReturnType<typeof createMotion<number>>;
  #motionWidth!: ReturnType<typeof createMotion<number>>;
  #motionHeight!: ReturnType<typeof createMotion<number>>;

  get motionX() {
    return this.#motionX.current;
  }
  get motionY() {
    return this.#motionY.current;
  }
  get motionWidth() {
    return this.#motionWidth.current;
  }
  get motionHeight() {
    return this.#motionHeight.current;
  }

  // Resolved per-corner radii (clamped to current bounds)
  resolveCorners(width: number, height: number) {
    const corners = this.#props.corners;
    if (corners === undefined) return undefined;
    return resolveCorners(corners, width, height);
  }

  roundedRectPath(x: number, y: number, width: number, height: number) {
    const corners = this.resolveCorners(width, height);
    if (!corners || !this.cornersNonUniform) return undefined;
    return roundedRectPath(x, y, width, height, corners);
  }

  borderRadius(width: number, height: number) {
    const corners = this.resolveCorners(width, height);
    return corners ? corners.map((c) => `${c}px`).join(' ') : undefined;
  }

  resolvedCorners = $derived.by(() => {
    return this.resolveCorners(this.motionWidth, this.motionHeight);
  });

  borderRadiusStyle = $derived(
    this.resolvedCorners ? this.resolvedCorners.map((c) => `${c}px`).join(' ') : undefined
  );

  pixelPathData = $derived.by(() => {
    if (this.resolvedCorners && this.cornersNonUniform) {
      return roundedRectPath(
        this.motionX,
        this.motionY,
        this.motionWidth,
        this.motionHeight,
        this.resolvedCorners
      );
    }
    return undefined;
  });

  // Static (non-data-driven) values for SVG/HTML pixel mode
  staticFill = $derived(
    typeof this.#props.fill === 'string' ? (this.#props.fill as string) : undefined
  );
  staticFillOpacity = $derived(
    typeof this.#props.fillOpacity === 'number' ? (this.#props.fillOpacity as number) : undefined
  );
  staticStroke = $derived(
    typeof this.#props.stroke === 'string' ? (this.#props.stroke as string) : undefined
  );
  staticStrokeOpacity = $derived(
    typeof this.#props.strokeOpacity === 'number'
      ? (this.#props.strokeOpacity as number)
      : undefined
  );
  staticStrokeWidth = $derived(
    typeof this.#props.strokeWidth === 'number' ? (this.#props.strokeWidth as number) : undefined
  );
  staticOpacity = $derived(
    typeof this.#props.opacity === 'number' ? (this.#props.opacity as number) : undefined
  );
  staticClassName = $derived(
    typeof this.#props.class === 'string' ? (this.#props.class as string) : undefined
  );
  // Match SVG's implicit `stroke-width: 1` default
  staticBorderWidth = $derived.by(() => {
    const props = this.#props;
    if (typeof props.strokeWidth === 'number') return `${props.strokeWidth}px`;
    if (typeof props.stroke === 'string') return '1px';
    return undefined;
  });

  constructor(getProps: () => RectProps) {
    this.#getProps = getProps;

    const initial = getProps();
    const initialX = initial.initialX ?? (typeof initial.x === 'number' ? initial.x : 0);
    const initialY = initial.initialY ?? (typeof initial.y === 'number' ? initial.y : 0);
    const initialWidth =
      initial.initialWidth ?? (typeof initial.width === 'number' ? initial.width : 0);
    const initialHeight =
      initial.initialHeight ?? (typeof initial.height === 'number' ? initial.height : 0);
    const motion = initial.motion;

    this.#motionX = createMotion(
      initialX,
      () => (typeof this.#props.x === 'number' ? (this.#props.x as number) : 0),
      motion === undefined ? undefined : parseMotionProp(motion, 'x')
    );
    this.#motionY = createMotion(
      initialY,
      () => (typeof this.#props.y === 'number' ? (this.#props.y as number) : 0),
      motion === undefined ? undefined : parseMotionProp(motion, 'y')
    );
    this.#motionWidth = createMotion(
      initialWidth,
      () => (typeof this.#props.width === 'number' ? (this.#props.width as number) : 0),
      motion === undefined ? undefined : parseMotionProp(motion, 'width')
    );
    this.#motionHeight = createMotion(
      initialHeight,
      () => (typeof this.#props.height === 'number' ? (this.#props.height as number) : 0),
      motion === undefined ? undefined : parseMotionProp(motion, 'height')
    );

    this.#dataMotionMap = createDataMotionMap(motion as MotionOptions | undefined);
    if (this.#dataMotionMap) {
      const motionMap = this.#dataMotionMap;
      $effect(() => {
        if (!this.dataMode) return;
        const props = this.#props;
        const keyFn = props.key ?? defaultKey;
        const activeKeys = new Set<any>();
        for (let i = 0; i < this.#resolvedData.length; i++) {
          const d = this.#resolvedData[i];
          const key = keyFn(d, i);
          activeKeys.add(key);
          const resolved = this.#resolveRect(d);
          untrack(() => motionMap.update(key, resolved));
        }
        untrack(() => motionMap.cleanup(activeKeys));
      });
    }
  }
}
