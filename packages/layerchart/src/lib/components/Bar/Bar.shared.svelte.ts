import type { SVGAttributes } from 'svelte/elements';
import { greatestAbs } from '@layerstack/utils';

import { createDimensionGetter, resolveInsets, type Insets } from '$lib/utils/rect.svelte.js';
import { accessor, type Accessor } from '$lib/utils/common.js';
import { getChartContext } from '$lib/contexts/chart.js';
import type { ChartState } from '$lib/states/chart.svelte.js';
import { type MotionProp } from '$lib/utils/motion.svelte.js';
import type { CommonEvents, CommonStyleProps, Without } from '$lib/utils/types.js';
import {
  resolveStyleProp,
  type DataDrivenStyleProps,
  type StyleProp,
} from '$lib/utils/dataProp.js';

export type BarPropsWithoutHTML = {
  /** Data to render the bar from */
  data: Object;
  /** Override `x` from context. @default ctx.x */
  x?: Accessor;
  /** Override `y` from context. @default ctx.y */
  y?: Accessor;
  /** Override `x1` from context. @default ctx.x1 */
  x1?: Accessor;
  /** Override `y1` from context. @default ctx.y1 */
  y1?: Accessor;
  /** Series key to use for accessor. */
  seriesKey?: string;
  /** Padding between stacked bars. */
  stackPadding?: number;
  radius?: number;
  insets?: Insets;
  initialX?: number;
  initialY?: number;
  initialHeight?: number;
  initialWidth?: number;
  /** Fixed width in pixels. */
  width?: number;
  /** Fixed height in pixels. */
  height?: number;
  /**
   * Which corners to round.  Takes an accessor as well as a value — which corner is the stack's
   * edge depends on the row, not just on the series.
   */
  rounded?: StyleProp<
    | 'all'
    | 'none'
    | 'edge'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
  >;
  motion?: MotionProp<'x' | 'y' | 'width' | 'height'>;
  /** Setup pointer events to show tooltip for related data. */
  tooltip?: boolean;
} & Omit<CommonStyleProps, 'fillOpacity' | 'strokeWidth' | 'opacity'> &
  // A bar draws a single row, so these take a per-row accessor as well as a static value.
  // `fill` / `stroke` stay static — a bar's color comes from `c` / the series.
  Pick<DataDrivenStyleProps, 'fillOpacity' | 'strokeWidth' | 'opacity'>;

export type BarProps = BarPropsWithoutHTML &
  Without<
    Omit<SVGAttributes<SVGElement>, 'width' | 'height' | 'x' | 'y' | 'offset'>,
    BarPropsWithoutHTML
  > &
  CommonEvents;

/**
 * Reactive state shared by every per-layer Bar variant. Holds the resolved
 * accessors, dimensions, corner-rounding flags, and motion-aware initial values.
 */
export class BarState {
  #getProps: () => BarProps = () => ({}) as BarProps;

  /**
   * Memoized props — the component's props closure allocates a fresh object
   * (it spreads `rest`), so calling it once per derived meant one allocation
   * per derived per update. Read it once here instead.
   */
  #props: BarProps = $derived(this.#getProps());

  ctx: ChartState = getChartContext();

  constructor(getProps: () => BarProps) {
    this.#getProps = getProps;
  }

  series = $derived.by(() => {
    const seriesKey = this.#props.seriesKey;
    return seriesKey ? this.ctx.series.series.find((s) => s.key === seriesKey) : undefined;
  });

  seriesAccessor = $derived(
    this.series
      ? (this.series.value ?? (this.series.data ? undefined : this.series.key))
      : undefined
  );

  stackAccessors = $derived.by(() =>
    this.ctx.stackAccessorsFor({
      seriesKey: this.#props.seriesKey,
      stacksImplicitly: true,
    })
  );

  x = $derived.by(() => {
    const xProp = this.#props.x;
    return (
      xProp ??
      (this.ctx.valueAxis === 'x'
        ? (this.stackAccessors?.value ?? this.seriesAccessor)
        : undefined) ??
      this.ctx.x
    );
  });
  y = $derived.by(() => {
    const yProp = this.#props.y;
    return (
      yProp ??
      (this.ctx.valueAxis === 'y'
        ? (this.stackAccessors?.value ?? this.seriesAccessor)
        : undefined) ??
      this.ctx.y
    );
  });
  x1 = $derived(this.#props.x1);
  y1 = $derived(this.#props.y1);

  seriesIndex = $derived.by(() => {
    const seriesKey = this.#props.seriesKey;
    return seriesKey
      ? this.ctx.series.visibleSeries.findIndex((s) => s.key === seriesKey)
      : undefined;
  });
  seriesCount = $derived(this.ctx.series.visibleSeries.length);

  stackInsets = $derived.by<Insets | undefined>(() => {
    const stackPadding = this.#props.stackPadding ?? 0;
    if (
      this.ctx.series.stackLayout == null ||
      stackPadding === 0 ||
      this.seriesIndex === undefined
    ) {
      return undefined;
    }

    const isFirst = this.seriesIndex === 0;
    const isLast = this.seriesIndex === this.seriesCount - 1;
    const stackInset = stackPadding / 2;

    if (this.ctx.valueAxis === 'y') {
      return {
        bottom: isFirst ? undefined : stackInset,
        top: isLast ? undefined : stackInset,
      };
    }
    return {
      left: isFirst ? undefined : stackInset,
      right: isLast ? undefined : stackInset,
    };
  });

  insets = $derived(this.#props.insets ?? this.stackInsets);

  getDimensions = $derived(
    createDimensionGetter(this.ctx, () => ({
      x: this.x,
      y: this.y,
      x1: this.x1,
      y1: this.y1,
      insets: this.insets,
    }))
  );

  /** With `valueAxis="z"`, the `x` × `y` band cell the bar stands on, else `null` */
  #footprint = $derived.by(() => {
    if (this.ctx.valueAxis !== 'z') return null;
    const d = this.#props.data;
    const insets = resolveInsets(this.insets);
    const band = (
      scale: any,
      value: any,
      subScale: any,
      subValue: (() => any) | null,
      before: number,
      after: number
    ) => {
      const sub = subValue && subScale;
      const start = (scale(value) ?? 0) + (sub ? (subScale(subValue()) ?? 0) : 0) + before;
      const size = (sub ? subScale.bandwidth?.() : scale.bandwidth?.()) ?? 0;
      return [start, Math.max(0, size - before - after)];
    };
    const x1 = this.x1 ?? this.ctx.config.x1;
    const y1 = this.y1 ?? this.ctx.config.y1;
    const [x, width] = band(
      this.ctx.xScale,
      accessor(this.x)(d),
      this.ctx.x1Scale,
      x1 != null ? () => accessor(x1)(d) : null,
      insets.left,
      insets.right
    );
    const [y, height] = band(
      this.ctx.yScale,
      accessor(this.y)(d),
      this.ctx.y1Scale,
      y1 != null ? () => accessor(y1)(d) : null,
      insets.top,
      insets.bottom
    );
    return { x, y, width, height };
  });

  /** With `valueAxis="z"`, the bar's `[start, end]` heights in pixels, else `undefined` */
  zExtent = $derived.by((): [number, number] | undefined => {
    if (this.ctx.valueAxis !== 'z') return undefined;
    const d = this.#props.data;
    const value = this.stackAccessors?.value(d) ?? this.ctx.z(d);
    const [a, b] = Array.isArray(value) ? value : [0, value];
    const z0 = this.ctx.zScale(Number(a) || 0);
    const z1 = this.ctx.zScale(Number(b) || 0);
    return [Math.min(z0, z1), Math.max(z0, z1)];
  });

  scaleDimensions = $derived(
    this.#footprint ?? this.getDimensions(this.#props.data) ?? { x: 0, y: 0, width: 0, height: 0 }
  );

  dimensions = $derived.by(() => {
    let { x, y, width, height } = this.scaleDimensions;
    const props = this.#props;

    if (props.width != null) {
      x = x + (width - props.width) / 2;
      width = props.width;
    }

    if (props.height != null) {
      y = y + (height - props.height) / 2;
      height = props.height;
    }

    return { x, y, width, height };
  });

  valueAccessor = $derived(accessor(this.ctx.valueAxis === 'y' ? this.y : this.x));
  resolvedValue = $derived.by(() => {
    const value = this.valueAccessor(this.#props.data);
    return Array.isArray(value) ? greatestAbs(value) : value;
  });

  /** Resolved `rounded="edge"` based on orientation and value */
  rounded = $derived.by(() => {
    const roundedProp = resolveStyleProp(this.#props.rounded, this.#props.data) ?? 'all';
    if (roundedProp !== 'edge') return roundedProp;
    if (this.ctx.valueAxis === 'y') {
      return this.resolvedValue >= 0 && this.ctx.yRange[0] > this.ctx.yRange[1] ? 'top' : 'bottom';
    }
    return this.resolvedValue >= 0 && this.ctx.xRange[0] < this.ctx.xRange[1] ? 'right' : 'left';
  });

  corners = $derived.by<[number, number, number, number]>(() => {
    const radius = this.#props.radius ?? 0;
    const rounded = this.rounded;
    const topLeft = ['all', 'top', 'left', 'top-left'].includes(rounded);
    const topRight = ['all', 'top', 'right', 'top-right'].includes(rounded);
    const bottomLeft = ['all', 'bottom', 'left', 'bottom-left'].includes(rounded);
    const bottomRight = ['all', 'bottom', 'right', 'bottom-right'].includes(rounded);
    return [
      topLeft ? radius : 0,
      topRight ? radius : 0,
      bottomRight ? radius : 0,
      bottomLeft ? radius : 0,
    ];
  });

  resolvedInitialY = $derived.by(() => {
    const props = this.#props;
    return (
      props.initialY ??
      (props.motion && this.ctx.valueAxis === 'y'
        ? Math.max(this.ctx.yRange[0], this.ctx.yRange[1])
        : undefined)
    );
  });
  resolvedInitialHeight = $derived.by(() => {
    const props = this.#props;
    return props.initialHeight ?? (props.motion && this.ctx.valueAxis === 'y' ? 0 : undefined);
  });
  resolvedInitialX = $derived.by(() => {
    const props = this.#props;
    return (
      props.initialX ??
      (props.motion && this.ctx.valueAxis === 'x'
        ? Math.min(this.ctx.xRange[0], this.ctx.xRange[1])
        : undefined)
    );
  });
  resolvedInitialWidth = $derived.by(() => {
    const props = this.#props;
    return props.initialWidth ?? (props.motion && this.ctx.valueAxis === 'x' ? 0 : undefined);
  });
}
