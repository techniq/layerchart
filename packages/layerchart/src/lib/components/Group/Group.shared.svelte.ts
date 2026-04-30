import type { Snippet } from 'svelte';
import { untrack } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

import type { Transition, TransitionParams, Without } from '$lib/utils/types.js';
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
  extractTweenConfig,
  type MotionProp,
} from '$lib/utils/motion.svelte.js';
import { fade } from 'svelte/transition';
import { cubicIn } from 'svelte/easing';
import { getChartContext } from '$lib/contexts/chart.js';
import { getGeoContext } from '$lib/contexts/geo.js';
import type { ChartState } from '$lib/states/chart.svelte.js';
import type { GeoState } from '$lib/states/geo.svelte.js';

export type GroupPropsWithoutHTML<In extends Transition = Transition> = {
  /**
   * Translate x position of the group.
   * - `number`: pixel value (direct)
   * - `string`: data property name, resolved via xScale
   * - `function(d)`: accessor called per data item, result passed through xScale
   */
  x?: DataProp;

  /** Initial translate x (pixel mode only). @default x */
  initialX?: number;

  /**
   * Translate y position of the group.
   * - `number`: pixel value (direct)
   * - `string`: data property name, resolved via yScale
   * - `function(d)`: accessor called per data item, result passed through yScale
   */
  y?: DataProp;

  /** Initial translate y (pixel mode only). @default y */
  initialY?: number;

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

  /** Center within chart. @default false */
  center?: boolean | 'x' | 'y';

  /**
   * Prevent `touchmove` default, which can interfere with `pointermove` when
   * used with `Tooltip`, for example.
   *
   * @default false
   */
  preventTouchMove?: boolean;

  /** The opacity of the element. (0 to 1) */
  opacity?: number;

  children?: Snippet;

  /**
   * A reference to the rendered DOM element, which could be
   * either nothing, a `<g>` element (when using `<Svg>`), or a `<div>` element
   * (when using `<Html>`).
   *
   * @bindable
   */
  ref?: Element;

  motion?: MotionProp;

  /** Transition function for entering elements @default fade if motion is tweened */
  transitionIn?: In;

  /** Parameters for the transitionIn function @default { easing: cubicIn } */
  transitionInParams?: TransitionParams<In>;
};

export type GroupProps<In extends Transition = Transition> = GroupPropsWithoutHTML<In> &
  Without<HTMLAttributes<Element>, GroupPropsWithoutHTML<In>>;

const defaultKey = (_: any, i: number) => i;

/**
 * Reactive state shared by every per-layer Group variant.
 */
export class GroupState {
  #getProps: () => GroupProps = () => ({}) as GroupProps;

  chartCtx: ChartState = getChartContext();
  geo: GeoState = getGeoContext();

  // Data mode detection
  dataMode = $derived(hasAnyDataProp(this.#getProps().x, this.#getProps().y));

  #resolvedData: any[] = $derived(
    this.dataMode ? (this.#getProps().data ?? chartDataArray(this.chartCtx.data)) : []
  );

  resolvedItems = $derived.by(() => {
    if (!this.dataMode) return [];
    const props = this.#getProps();
    const keyFn = props.key ?? defaultKey;
    return this.#resolvedData.map((d, i) => {
      const key = keyFn(d, i);
      const resolved = this.#resolveGroup(d);
      const animated = this.#dataMotionMap?.get(key);
      return {
        d,
        key,
        x: animated?.x ?? resolved.x,
        y: animated?.y ?? resolved.y,
      };
    });
  });

  #resolveGroup(d: any): { x: number; y: number } {
    const props = this.#getProps();
    if (this.geo.projection) {
      const [projX, projY] = resolveGeoDataPair(props.x, props.y, d, this.geo.projection);
      return { x: projX, y: projY };
    }
    return {
      x: resolveDataProp(props.x, d, this.chartCtx.xScale, 0),
      y: resolveDataProp(props.y, d, this.chartCtx.yScale, 0),
    };
  }

  // Pixel-mode position (with center support)
  trueX = $derived.by(() => {
    const props = this.#getProps();
    if (typeof props.x === 'number') return props.x;
    if (props.x == null && (props.center === 'x' || props.center === true))
      return this.chartCtx.width / 2;
    return 0;
  });
  trueY = $derived.by(() => {
    const props = this.#getProps();
    if (typeof props.y === 'number') return props.y;
    if (props.y == null && (props.center === 'y' || props.center === true))
      return this.chartCtx.height / 2;
    return 0;
  });

  #dataMotionMap: ReturnType<typeof createDataMotionMap> = null;
  // Pixel-mode motion sources. Only allocated when the user opts into
  // animation via the `motion` prop; otherwise the getters return `trueX`/`trueY`.
  #motionX: ReturnType<typeof createMotion<number | undefined>> | null = null;
  #motionY: ReturnType<typeof createMotion<number | undefined>> | null = null;

  get motionX() {
    if (this.#motionX) return this.#motionX.current;
    return this.trueX;
  }
  get motionY() {
    if (this.#motionY) return this.#motionY.current;
    return this.trueY;
  }

  // Transform string for SVG/HTML pixel mode
  transform = $derived.by(() => {
    const props = this.#getProps();
    if (props.center || props.x != null || props.y != null) {
      return `translate(${this.motionX}px, ${this.motionY}px)`;
    }
    return undefined;
  });

  // Default transition (fade when motion is tweened)
  defaultTransitionIn = $derived(
    extractTweenConfig(this.#getProps().motion)?.options ? fade : () => ({})
  );
  defaultTransitionInParams = { easing: cubicIn };

  constructor(getProps: () => GroupProps) {
    this.#getProps = getProps;

    const initial = getProps();

    if (initial.motion !== undefined) {
      const initialX = initial.initialX ?? (typeof initial.x === 'number' ? initial.x : undefined);
      const initialY = initial.initialY ?? (typeof initial.y === 'number' ? initial.y : undefined);

      this.#motionX = createMotion(initialX, () => this.trueX, initial.motion);
      this.#motionY = createMotion(initialY, () => this.trueY, initial.motion);
    }

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
          const resolved = this.#resolveGroup(d);
          untrack(() => motionMap.update(key, resolved));
        }
        untrack(() => motionMap.cleanup(activeKeys));
      });
    }
  }
}
