import { untrack } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import { get } from '@layerstack/utils';

import type { Without } from '$lib/utils/types.js';
import type { DataProp } from '$lib/utils/dataProp.js';
import {
  hasAnyDataProp,
  resolveDataProp,
  resolveGeoDataPair,
} from '$lib/utils/dataProp.js';
import { chartDataArray } from '$lib/utils/common.js';
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

export type ImagePropsWithoutHTML = {
  /**
   * Image URL. In data mode, resolved per item.
   */
  href?: string | ((d: any) => string);
  x?: DataProp;
  initialX?: number;
  y?: DataProp;
  initialY?: number;
  width?: DataProp;
  initialWidth?: number;
  height?: DataProp;
  initialHeight?: number;
  /** Circular clip radius. When set, overrides width/height to 2*r. */
  r?: DataProp;
  /** Rotation in degrees clockwise. */
  rotate?: DataProp;
  /** SVG preserveAspectRatio attribute. @default 'xMidYMid meet' */
  preserveAspectRatio?: string;
  /** CORS attribute for the image. */
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
  /** Image rendering quality. */
  imageRendering?: string;
  /** The opacity of the image. (0 to 1) */
  opacity?: number;
  /** Data array to iterate over in data mode. */
  data?: any[];
  /** Key function for keyed {#each} rendering in data mode. @default (d, i) => i */
  key?: (d: any, index: number) => any;
  /** A bindable reference to the `<image>` element (pixel mode only). @bindable */
  ref?: SVGImageElement;
  /** Motion configuration (pixel mode only). */
  motion?: MotionProp<'x' | 'y' | 'width' | 'height'>;
};

export type ImageProps = ImagePropsWithoutHTML &
  Without<SVGAttributes<SVGImageElement>, ImagePropsWithoutHTML>;

const defaultKey = (_: any, i: number) => i;

export function imageMarkInfo(props: ImageProps, dataMode: boolean) {
  if (!dataMode) return {};
  return {
    data: props.data,
    x: typeof props.x === 'string' ? props.x : undefined,
    y: typeof props.y === 'string' ? props.y : undefined,
  };
}

export class ImageState {
  #getProps: () => ImageProps = () => ({}) as ImageProps;

  chartCtx: ChartState = getChartContext();
  geo: GeoState = getGeoContext();

  dataMode = $derived(
    hasAnyDataProp(
      this.#getProps().x,
      this.#getProps().y,
      this.#getProps().width,
      this.#getProps().height,
      this.#getProps().r
    ) || typeof this.#getProps().href === 'function'
  );

  #resolvedData: any[] = $derived(
    this.dataMode ? (this.#getProps().data ?? chartDataArray(this.chartCtx.data)) : []
  );

  resolveImage(d: any) {
    const props = this.#getProps();
    const resolvedR =
      props.r !== undefined ? resolveDataProp(props.r, d, null, 0) : undefined;
    const defaultSize = resolvedR !== undefined ? resolvedR * 2 : 16;
    const resolvedWidth =
      props.width !== undefined
        ? resolveDataProp(props.width, d, null, defaultSize)
        : defaultSize;
    const resolvedHeight =
      props.height !== undefined
        ? resolveDataProp(props.height, d, null, defaultSize)
        : defaultSize;

    let resolvedX: number, resolvedY: number;
    if (this.geo.projection) {
      [resolvedX, resolvedY] = resolveGeoDataPair(props.x, props.y, d, this.geo.projection);
    } else {
      resolvedX = resolveDataProp(props.x, d, this.chartCtx.xScale, 0);
      resolvedY = resolveDataProp(props.y, d, this.chartCtx.yScale, 0);
    }

    return {
      x: resolvedX,
      y: resolvedY,
      width: resolvedWidth,
      height: resolvedHeight,
      r: resolvedR,
      rotate: props.rotate !== undefined ? resolveDataProp(props.rotate, d, null, 0) : undefined,
    };
  }

  resolveHref(d: any): string | undefined {
    const href = this.#getProps().href;
    if (!href) return undefined;
    if (typeof href === 'function') return href(d);
    const dataValue = get(d, href);
    if (dataValue !== undefined) return String(dataValue);
    return href;
  }

  resolvedItems = $derived.by(() => {
    if (!this.dataMode) return [];
    const props = this.#getProps();
    const keyFn = props.key ?? defaultKey;
    return this.#resolvedData.map((d, i) => {
      const key = keyFn(d, i);
      const resolved = this.resolveImage(d);
      const animated = this.#dataMotionMap?.get(key);
      return {
        d,
        key,
        x: animated?.x ?? resolved.x,
        y: animated?.y ?? resolved.y,
        width: animated?.width ?? resolved.width,
        height: animated?.height ?? resolved.height,
        r: resolved.r,
        rotate: resolved.rotate,
      };
    });
  });

  // Pixel-mode helpers
  defaultSize = $derived(
    typeof this.#getProps().r === 'number' ? (this.#getProps().r as number) * 2 : 16
  );
  resolvedPixelWidth = $derived(
    typeof this.#getProps().width === 'number'
      ? (this.#getProps().width as number)
      : this.defaultSize
  );
  resolvedPixelHeight = $derived(
    typeof this.#getProps().height === 'number'
      ? (this.#getProps().height as number)
      : this.defaultSize
  );
  pixelR = $derived(
    typeof this.#getProps().r === 'number' ? (this.#getProps().r as number) : undefined
  );
  pixelRotate = $derived(
    typeof this.#getProps().rotate === 'number' ? (this.#getProps().rotate as number) : undefined
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
    return this.resolvedPixelWidth;
  }
  get motionHeight() {
    if (this.#motionHeight) return this.#motionHeight.current;
    return this.resolvedPixelHeight;
  }

  constructor(getProps: () => ImageProps) {
    this.#getProps = getProps;

    const initial = getProps();
    const motion = initial.motion;

    if (motion !== undefined) {
      const initialX = initial.initialX ?? (typeof initial.x === 'number' ? initial.x : 0);
      const initialY = initial.initialY ?? (typeof initial.y === 'number' ? initial.y : 0);
      const initialWidth =
        initial.initialWidth ??
        (typeof initial.width === 'number'
          ? initial.width
          : typeof initial.r === 'number'
            ? initial.r * 2
            : 16);
      const initialHeight =
        initial.initialHeight ??
        (typeof initial.height === 'number'
          ? initial.height
          : typeof initial.r === 'number'
            ? initial.r * 2
            : 16);

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
        () => this.resolvedPixelWidth,
        parseMotionProp(motion, 'width')
      );
      this.#motionHeight = createMotion(
        initialHeight,
        () => this.resolvedPixelHeight,
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
          const resolved = this.resolveImage(d);
          untrack(() =>
            motionMap.update(key, {
              x: resolved.x,
              y: resolved.y,
              width: resolved.width,
              height: resolved.height,
            })
          );
        }
        untrack(() => motionMap.cleanup(activeKeys));
      });
    }
  }
}
