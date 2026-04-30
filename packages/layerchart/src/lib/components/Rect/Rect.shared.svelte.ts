import type { Snippet } from 'svelte';
import { untrack } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';

import type { CommonEvents, Without } from '$lib/utils/types.js';
import type { DataProp, DataDrivenStyleProps } from '$lib/utils/dataProp.js';
import {
  hasAnyDataProp,
  resolveDataProp,
  resolveGeoDataPair,
} from '$lib/utils/dataProp.js';
import { chartDataArray } from '$lib/utils/common.js';
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
  width?: number;
  initialWidth?: number;

  /**
   * The height of the rectangle (pixels).
   *
   * @default 0
   */
  height?: number;
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
   * Underlying `<rect>` tag when using <Svg>. Useful for bindings (pixel mode only).
   *
   * @bindable
   */
  ref?: SVGRectElement;

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

  // Contexts
  chartCtx: ChartState = getChartContext();
  geo: GeoState = getGeoContext();

  // Data mode detection
  hasEdgeProps = $derived(
    hasAnyDataProp(
      this.#getProps().x0,
      this.#getProps().y0,
      this.#getProps().x1,
      this.#getProps().y1
    )
  );
  dataMode = $derived(
    hasAnyDataProp(this.#getProps().x, this.#getProps().y) || this.hasEdgeProps
  );

  // Data resolution
  #resolvedData: any[] = $derived(
    this.dataMode ? (this.#getProps().data ?? chartDataArray(this.chartCtx.data)) : []
  );

  resolvedItems = $derived.by(() => {
    if (!this.dataMode) return [];
    const props = this.#getProps();
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
    const props = this.#getProps();
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
        width: Math.max(0, (props.width ?? 0) - resolvedInsets.left - resolvedInsets.right),
        height: Math.max(0, (props.height ?? 0) - resolvedInsets.top - resolvedInsets.bottom),
      };
    }
  }

  // Dash array
  dashArrayResolved = $derived(parseDashArray(this.#getProps().dashArray));
  dashArrayAttr = $derived(this.dashArrayResolved ? this.dashArrayResolved.join(' ') : undefined);

  // Corners
  cornersUniformValue = $derived.by(() => {
    const corners = this.#getProps().corners;
    if (corners === undefined) return undefined;
    if (typeof corners === 'number') return corners;
    const resolved = resolveCorners(corners, Infinity, Infinity);
    return cornersUniform(resolved) ? resolved[0] : undefined;
  });
  cornersNonUniform = $derived(
    this.#getProps().corners !== undefined && this.cornersUniformValue === undefined
  );

  // Normalize rx/ry: if only one provided, use for both (SVG behavior)
  rx = $derived(
    Number(
      (this.#getProps() as any).rx ?? (this.#getProps() as any).ry ?? this.cornersUniformValue
    ) || 0
  );
  ry = $derived(
    Number(
      (this.#getProps() as any).ry ?? (this.#getProps() as any).rx ?? this.cornersUniformValue
    ) || 0
  );

  // Pixel-mode motion sources. Only allocated when the user opts into
  // animation via the `motion` prop; otherwise the getters read directly
  // from props.
  #dataMotionMap: ReturnType<typeof createDataMotionMap> = null;
  #motionX: ReturnType<typeof createMotion<number>> | null = null;
  #motionY: ReturnType<typeof createMotion<number>> | null = null;
  #motionWidth: ReturnType<typeof createMotion<number>> | null = null;
  #motionHeight: ReturnType<typeof createMotion<number>> | null = null;

  get motionX() {
    if (this.#motionX) return this.#motionX.current;
    const x = this.#getProps().x;
    return typeof x === 'number' ? x : 0;
  }
  get motionY() {
    if (this.#motionY) return this.#motionY.current;
    const y = this.#getProps().y;
    return typeof y === 'number' ? y : 0;
  }
  get motionWidth() {
    if (this.#motionWidth) return this.#motionWidth.current;
    return this.#getProps().width ?? 0;
  }
  get motionHeight() {
    if (this.#motionHeight) return this.#motionHeight.current;
    return this.#getProps().height ?? 0;
  }

  // Resolved per-corner radii (clamped to current bounds)
  resolvedCorners = $derived.by(() => {
    const corners = this.#getProps().corners;
    if (corners === undefined) return undefined;
    return resolveCorners(corners, this.motionWidth, this.motionHeight);
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
  staticStrokeOpacity = $derived(
    typeof this.#getProps().strokeOpacity === 'number'
      ? (this.#getProps().strokeOpacity as number)
      : undefined
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
  // Match SVG's implicit `stroke-width: 1` default
  staticBorderWidth = $derived.by(() => {
    const props = this.#getProps();
    if (typeof props.strokeWidth === 'number') return `${props.strokeWidth}px`;
    if (typeof props.stroke === 'string') return '1px';
    return undefined;
  });

  constructor(getProps: () => RectProps) {
    this.#getProps = getProps;

    const initial = getProps();
    const motion = initial.motion;

    if (motion !== undefined) {
      const initialX = initial.initialX ?? (typeof initial.x === 'number' ? initial.x : 0);
      const initialY = initial.initialY ?? (typeof initial.y === 'number' ? initial.y : 0);
      const initialWidth = initial.initialWidth ?? initial.width ?? 0;
      const initialHeight = initial.initialHeight ?? initial.height ?? 0;

      this.#motionX = createMotion(
        initialX,
        () => (typeof getProps().x === 'number' ? (getProps().x as number) : 0),
        parseMotionProp(motion, 'x')
      );
      this.#motionY = createMotion(
        initialY,
        () => (typeof getProps().y === 'number' ? (getProps().y as number) : 0),
        parseMotionProp(motion, 'y')
      );
      this.#motionWidth = createMotion(
        initialWidth,
        () => getProps().width ?? 0,
        parseMotionProp(motion, 'width')
      );
      this.#motionHeight = createMotion(
        initialHeight,
        () => getProps().height ?? 0,
        parseMotionProp(motion, 'height')
      );
    }

    this.#dataMotionMap = createDataMotionMap(motion as MotionOptions | undefined);
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
          const resolved = this.#resolveRect(d);
          untrack(() => motionMap.update(key, resolved));
        }
        untrack(() => motionMap.cleanup(activeKeys));
      });
    }
  }
}
