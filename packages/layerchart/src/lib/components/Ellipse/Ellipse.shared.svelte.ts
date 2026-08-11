import { untrack } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';

import type { Without } from '$lib/utils/types.js';
import type { DataProp, DataDrivenStyleProps } from '$lib/utils/dataProp.js';
import { hasAnyDataProp, resolveDataProp, resolveGeoDataPair } from '$lib/utils/dataProp.js';
import { chartDataArray } from '$lib/utils/common.js';
import { createMotion, createDataMotionMap, type MotionProp } from '$lib/utils/motion.svelte.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { getGeoContext } from '$lib/contexts/geo.js';
import type { ChartState } from '$lib/states/chart.svelte.js';
import type { GeoState } from '$lib/states/geo.svelte.js';

export type EllipsePropsWithoutHTML = {
  /** The center x position of the ellipse. @default 0 */
  cx?: DataProp;
  /** The initial center x position of the ellipse (pixel mode only). @default cx */
  initialCx?: number;
  /** The center y position of the ellipse. @default 0 */
  cy?: DataProp;
  /** The initial center y position of the ellipse (pixel mode only). @default cy */
  initialCy?: number;
  /** The radius of the ellipse on the x-axis. @default 1 */
  rx?: DataProp;
  /** The initial radius of the ellipse on the x-axis (pixel mode only). @default rx */
  initialRx?: number;
  /** The radius of the ellipse on the y-axis. @default 1 */
  ry?: DataProp;
  /** The initial radius of the ellipse on the y-axis (pixel mode only). @default ry */
  initialRy?: number;
  /** Data array to iterate over in data mode. */
  data?: any[];
  /** Key function for keyed {#each} rendering in data mode. @default (d, i) => i */
  key?: (d: any, index: number) => any;
  /** A bindable reference to the `<ellipse>` element (pixel mode only). @bindable */
  ref?: SVGEllipseElement;
  /** Motion configuration (pixel mode only). */
  motion?: MotionProp;
} & DataDrivenStyleProps;

export type EllipseProps = EllipsePropsWithoutHTML &
  Without<SVGAttributes<Element>, EllipsePropsWithoutHTML>;

const defaultKey = (_: any, i: number) => i;

export function ellipseMarkInfo(props: EllipseProps, dataMode: boolean) {
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

export class EllipseState {
  #getProps: () => EllipseProps = () => ({}) as EllipseProps;

  /**
   * Memoized props — the component's props closure allocates a fresh object
   * (it spreads `rest`), so calling it once per derived meant one allocation
   * per derived per update. Read it once here instead.
   */
  #props: EllipseProps = $derived(this.#getProps());

  chartCtx: ChartState = getChartContext();
  geo: GeoState = getGeoContext();

  dataMode = $derived(
    hasAnyDataProp(this.#props.cx, this.#props.cy, this.#props.rx, this.#props.ry)
  );

  #resolvedData: any[] = $derived(
    this.dataMode ? (this.#props.data ?? chartDataArray(this.chartCtx.data)) : []
  );

  resolvedItems = $derived.by(() => {
    if (!this.dataMode) return [];
    const props = this.#props;
    const keyFn = props.key ?? defaultKey;
    return this.#resolvedData.map((d, i) => {
      const key = keyFn(d, i);
      const resolved = this.#resolveEllipse(d);
      const animated = this.#dataMotionMap?.get(key);
      return {
        d,
        key,
        cx: animated?.cx ?? resolved.cx,
        cy: animated?.cy ?? resolved.cy,
        rx: animated?.rx ?? resolved.rx,
        ry: animated?.ry ?? resolved.ry,
      };
    });
  });

  #resolveEllipse(d: any) {
    const props = this.#props;
    if (this.geo.projection) {
      const [projX, projY] = resolveGeoDataPair(props.cx, props.cy, d, this.geo.projection);
      return {
        cx: projX,
        cy: projY,
        rx: resolveDataProp(
          props.rx,
          d,
          this.chartCtx.rScale,
          typeof props.rx === 'number' ? props.rx : 1
        ),
        ry: resolveDataProp(
          props.ry,
          d,
          this.chartCtx.rScale,
          typeof props.ry === 'number' ? props.ry : 1
        ),
      };
    }
    return {
      cx: resolveDataProp(props.cx, d, this.chartCtx.xScale, 0),
      cy: resolveDataProp(props.cy, d, this.chartCtx.yScale, 0),
      rx: resolveDataProp(
        props.rx,
        d,
        this.chartCtx.rScale,
        typeof props.rx === 'number' ? props.rx : 1
      ),
      ry: resolveDataProp(
        props.ry,
        d,
        this.chartCtx.rScale,
        typeof props.ry === 'number' ? props.ry : 1
      ),
    };
  }

  #dataMotionMap: ReturnType<typeof createDataMotionMap> = null;
  #motionCx!: ReturnType<typeof createMotion<number>>;
  #motionCy!: ReturnType<typeof createMotion<number>>;
  #motionRx!: ReturnType<typeof createMotion<number>>;
  #motionRy!: ReturnType<typeof createMotion<number>>;

  get motionCx() {
    return this.#motionCx.current;
  }
  get motionCy() {
    return this.#motionCy.current;
  }
  get motionRx() {
    return this.#motionRx.current;
  }
  get motionRy() {
    return this.#motionRy.current;
  }

  staticFill = $derived(
    typeof this.#props.fill === 'string' ? (this.#props.fill as string) : undefined
  );
  staticFillOpacity = $derived(
    typeof this.#props.fillOpacity === 'number' ? (this.#props.fillOpacity as number) : undefined
  );
  staticStroke = $derived(
    typeof this.#props.stroke === 'string' ? (this.#props.stroke as string) : undefined
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
  staticBorderWidth = $derived.by(() => {
    const props = this.#props;
    if (typeof props.strokeWidth === 'number') return `${props.strokeWidth}px`;
    if (typeof props.stroke === 'string') return '1px';
    return undefined;
  });

  constructor(getProps: () => EllipseProps) {
    this.#getProps = getProps;

    const initial = getProps();
    const initialCx = initial.initialCx ?? (typeof initial.cx === 'number' ? initial.cx : 0);
    const initialCy = initial.initialCy ?? (typeof initial.cy === 'number' ? initial.cy : 0);
    const initialRx = initial.initialRx ?? (typeof initial.rx === 'number' ? initial.rx : 1);
    const initialRy = initial.initialRy ?? (typeof initial.ry === 'number' ? initial.ry : 1);

    this.#motionCx = createMotion(
      initialCx,
      () => (typeof this.#props.cx === 'number' ? (this.#props.cx as number) : 0),
      initial.motion
    );
    this.#motionCy = createMotion(
      initialCy,
      () => (typeof this.#props.cy === 'number' ? (this.#props.cy as number) : 0),
      initial.motion
    );
    this.#motionRx = createMotion(
      initialRx,
      () => (typeof this.#props.rx === 'number' ? (this.#props.rx as number) : 1),
      initial.motion
    );
    this.#motionRy = createMotion(
      initialRy,
      () => (typeof this.#props.ry === 'number' ? (this.#props.ry as number) : 1),
      initial.motion
    );

    this.#dataMotionMap = createDataMotionMap(initial.motion);
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
          const resolved = this.#resolveEllipse(d);
          untrack(() => motionMap.update(key, resolved));
        }
        untrack(() => motionMap.cleanup(activeKeys));
      });
    }
  }
}
