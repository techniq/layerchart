import { untrack } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import { interpolatePath } from 'd3-interpolate-path';

import type { Without } from '$lib/utils/types.js';
import type { DataProp, DataDrivenStyleProps } from '$lib/utils/dataProp.js';
import {
  hasAnyDataProp,
  resolveDataProp,
  resolveGeoDataPair,
} from '$lib/utils/dataProp.js';
import { chartDataArray } from '$lib/utils/common.js';
import { polygon } from '$lib/utils/shape.js';
import { roundedPolygonPath } from '$lib/utils/path.js';
import {
  createMotion,
  createDataMotionMap,
  extractTweenConfig,
  type MotionProp,
  type ResolvedMotion,
} from '$lib/utils/motion.svelte.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { getGeoContext } from '$lib/contexts/geo.js';
import type { ChartState } from '$lib/states/chart.svelte.js';
import type { GeoState } from '$lib/states/geo.svelte.js';

export type PolygonPropsWithoutHTML = {
  cx?: DataProp;
  initialCx?: number;
  cy?: DataProp;
  initialCy?: number;
  r?: DataProp;
  initialR?: number;
  data?: any[];
  key?: (d: any, index: number) => any;
  /** The number of points or explicit points to create the polygon. @default 4 */
  points?: number | { x: number; y: number }[];
  /** The radius of the curve for rounded corners. @default 0 */
  cornerRadius?: number;
  /** The rotation of the polygon. @default 0 */
  rotate?: number;
  /** The percent to inset the odd points of the star (<1 inset, >1 outset). @default 0 */
  inset?: number;
  /** The horizontal stretch factor of the polygon. @default 1 */
  scaleX?: number;
  /** The vertical stretch factor of the polygon. @default 1 */
  scaleY?: number;
  /** The skew angle in degrees along the X axis. @default 0 */
  skewX?: number;
  /** The skew angle in degrees along the Y axis. @default 0 */
  skewY?: number;
  /** The tilt factor for x-coordinates. @default 1 */
  tiltX?: number;
  /** The tilt factor for y-coordinates. @default 1 */
  tiltY?: number;
  /** A bindable reference to the `<path>` element. @bindable */
  ref?: SVGPathElement;
  motion?: MotionProp;
} & DataDrivenStyleProps;

export type PolygonProps = PolygonPropsWithoutHTML &
  Without<SVGAttributes<Element>, PolygonPropsWithoutHTML>;

const defaultKey = (_: any, i: number) => i;

export function polygonMarkInfo(props: PolygonProps, dataMode: boolean) {
  if (!dataMode) return {};
  return {
    data: props.data,
    x: typeof props.cx === 'string' ? props.cx : undefined,
    y: typeof props.cy === 'string' ? props.cy : undefined,
    color:
      typeof props.fill === 'string'
        ? props.fill
        : typeof props.stroke === 'string'
          ? props.stroke
          : undefined,
  };
}

export class PolygonState {
  #getProps: () => PolygonProps = () => ({}) as PolygonProps;

  chartCtx: ChartState = getChartContext();
  geo: GeoState = getGeoContext();

  dataMode = $derived(
    hasAnyDataProp(this.#getProps().cx, this.#getProps().cy, this.#getProps().r)
  );

  resolvedData: any[] = $derived(
    this.dataMode ? (this.#getProps().data ?? chartDataArray(this.chartCtx.data)) : []
  );

  resolvedItems = $derived.by(() => {
    if (!this.dataMode) return [];
    const props = this.#getProps();
    const keyFn = props.key ?? defaultKey;
    return this.resolvedData.map((d, i) => {
      const key = keyFn(d, i);
      let resolvedCx: number, resolvedCy: number;
      if (this.geo.projection) {
        [resolvedCx, resolvedCy] = resolveGeoDataPair(props.cx, props.cy, d, this.geo.projection);
      } else {
        resolvedCx = resolveDataProp(props.cx, d, this.chartCtx.xScale, 0);
        resolvedCy = resolveDataProp(props.cy, d, this.chartCtx.yScale, 0);
      }
      const resolvedR = resolveDataProp(
        props.r,
        d,
        this.chartCtx.rScale,
        typeof props.r === 'number' ? props.r : 1
      );
      const animated = this.#dataMotionMap?.get(key);
      return {
        d,
        key,
        cx: animated?.cx ?? resolvedCx,
        cy: animated?.cy ?? resolvedCy,
        r: animated?.r ?? resolvedR,
      };
    });
  });

  /** Resolve a single data item to a polygon path string. */
  resolvePolygonPath(d: any): string {
    const props = this.#getProps();
    let resolvedCx: number, resolvedCy: number;
    if (this.geo.projection) {
      [resolvedCx, resolvedCy] = resolveGeoDataPair(props.cx, props.cy, d, this.geo.projection);
    } else {
      resolvedCx = resolveDataProp(props.cx, d, this.chartCtx.xScale, 0);
      resolvedCy = resolveDataProp(props.cy, d, this.chartCtx.yScale, 0);
    }
    const resolvedR = resolveDataProp(
      props.r,
      d,
      this.chartCtx.rScale,
      typeof props.r === 'number' ? props.r : 1
    );

    const pts =
      typeof props.points === 'number' || props.points === undefined
        ? polygon({
            cx: resolvedCx,
            cy: resolvedCy,
            count: typeof props.points === 'number' ? props.points : 4,
            radius: resolvedR,
            rotate: props.rotate ?? 0,
            inset: props.inset ?? 0,
            scaleX: props.scaleX ?? 1,
            scaleY: props.scaleY ?? 1,
            skewX: props.skewX ?? 0,
            skewY: props.skewY ?? 0,
            tiltX: props.tiltX ?? 0,
            tiltY: props.tiltY ?? 0,
          })
        : props.points;

    return roundedPolygonPath(pts, props.cornerRadius ?? 0);
  }

  // Pixel-mode motion sources
  #dataMotionMap: ReturnType<typeof createDataMotionMap> = null;
  #motionCx!: ReturnType<typeof createMotion<number>>;
  #motionCy!: ReturnType<typeof createMotion<number>>;
  #motionR!: ReturnType<typeof createMotion<number>>;
  #tweenedState!: ReturnType<typeof createMotion<string | null>>;

  get motionCx() {
    return this.#motionCx.current;
  }
  get motionCy() {
    return this.#motionCy.current;
  }
  get motionR() {
    return this.#motionR.current;
  }
  get tweenedPathData() {
    return this.#tweenedState.current;
  }

  // Pixel-mode polygon path string (depends on motion + transform props)
  pixelPathData = $derived.by(() => {
    const props = this.#getProps();
    const pts =
      typeof props.points === 'number' || props.points === undefined
        ? polygon({
            cx: this.motionCx,
            cy: this.motionCy,
            count: typeof props.points === 'number' ? props.points : 4,
            radius: this.motionR,
            rotate: props.rotate ?? 0,
            inset: props.inset ?? 0,
            scaleX: props.scaleX ?? 1,
            scaleY: props.scaleY ?? 1,
            skewX: props.skewX ?? 0,
            skewY: props.skewY ?? 0,
            tiltX: props.tiltX ?? 0,
            tiltY: props.tiltY ?? 0,
          })
        : props.points;
    return roundedPolygonPath(pts, props.cornerRadius ?? 0);
  });

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

  constructor(getProps: () => PolygonProps) {
    this.#getProps = getProps;

    const initial = getProps();
    const initialCx = initial.initialCx ?? (typeof initial.cx === 'number' ? initial.cx : 0);
    const initialCy = initial.initialCy ?? (typeof initial.cy === 'number' ? initial.cy : 0);
    const initialR = initial.initialR ?? (typeof initial.r === 'number' ? initial.r : 1);

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

    const extractedTween = extractTweenConfig(initial.motion);
    const tweenedOptions: ResolvedMotion | undefined = extractedTween
      ? {
          type: extractedTween.type,
          options: { interpolate: interpolatePath, ...extractedTween.options },
        }
      : undefined;
    this.#tweenedState = createMotion<string | null>(
      null,
      () => this.pixelPathData,
      tweenedOptions
    );

    this.#dataMotionMap = createDataMotionMap(initial.motion);
    if (this.#dataMotionMap) {
      const motionMap = this.#dataMotionMap;
      $effect(() => {
        if (!this.dataMode) return;
        const props = getProps();
        const keyFn = props.key ?? defaultKey;
        const activeKeys = new Set<any>();
        for (let i = 0; i < this.resolvedData.length; i++) {
          const d = this.resolvedData[i];
          const key = keyFn(d, i);
          activeKeys.add(key);
          let resolvedCx: number, resolvedCy: number;
          if (this.geo.projection) {
            [resolvedCx, resolvedCy] = resolveGeoDataPair(props.cx, props.cy, d, this.geo.projection);
          } else {
            resolvedCx = resolveDataProp(props.cx, d, this.chartCtx.xScale, 0);
            resolvedCy = resolveDataProp(props.cy, d, this.chartCtx.yScale, 0);
          }
          const resolvedR = resolveDataProp(
            props.r,
            d,
            this.chartCtx.rScale,
            typeof props.r === 'number' ? props.r : 1
          );
          untrack(() =>
            motionMap.update(key, { cx: resolvedCx, cy: resolvedCy, r: resolvedR })
          );
        }
        untrack(() => motionMap.cleanup(activeKeys));
      });
    }
  }
}
