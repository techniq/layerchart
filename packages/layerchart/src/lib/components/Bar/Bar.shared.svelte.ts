import type { SVGAttributes } from 'svelte/elements';
import { greatestAbs } from '@layerstack/utils';

import { createDimensionGetter, type Insets } from '$lib/utils/rect.svelte.js';
import { accessor, type Accessor } from '$lib/utils/common.js';
import { getChartContext } from '$lib/contexts/chart.js';
import type { ChartState } from '$lib/states/chart.svelte.js';
import { type MotionProp } from '$lib/utils/motion.svelte.js';
import type { CommonEvents, CommonStyleProps, Without } from '$lib/utils/types.js';

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
  rounded?:
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
    | 'bottom-right';
  motion?: MotionProp<'x' | 'y' | 'width' | 'height'>;
  /** Setup pointer events to show tooltip for related data. */
  tooltip?: boolean;
} & CommonStyleProps;

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
  ctx: ChartState = getChartContext();

  constructor(getProps: () => BarProps) {
    this.#getProps = getProps;
  }

  series = $derived.by(() => {
    const seriesKey = this.#getProps().seriesKey;
    return seriesKey ? this.ctx.series.series.find((s) => s.key === seriesKey) : undefined;
  });

  seriesAccessor = $derived(
    this.series ? this.series.value ?? (this.series.data ? undefined : this.series.key) : undefined
  );

  stackAccessors = $derived.by(() => {
    const seriesKey = this.#getProps().seriesKey;
    return seriesKey && this.ctx.series.isStacked
      ? this.ctx.series.getStackAccessors(seriesKey)
      : null;
  });

  x = $derived.by(() => {
    const xProp = this.#getProps().x;
    return (
      xProp ??
      (this.ctx.valueAxis === 'x' ? this.stackAccessors?.value ?? this.seriesAccessor : undefined) ??
      this.ctx.x
    );
  });
  y = $derived.by(() => {
    const yProp = this.#getProps().y;
    return (
      yProp ??
      (this.ctx.valueAxis === 'y' ? this.stackAccessors?.value ?? this.seriesAccessor : undefined) ??
      this.ctx.y
    );
  });
  x1 = $derived(this.#getProps().x1);
  y1 = $derived(this.#getProps().y1);

  seriesIndex = $derived.by(() => {
    const seriesKey = this.#getProps().seriesKey;
    return seriesKey
      ? this.ctx.series.visibleSeries.findIndex((s) => s.key === seriesKey)
      : undefined;
  });
  seriesCount = $derived(this.ctx.series.visibleSeries.length);

  stackInsets = $derived.by<Insets | undefined>(() => {
    const stackPadding = this.#getProps().stackPadding ?? 0;
    if (!this.ctx.series.isStacked || stackPadding === 0 || this.seriesIndex === undefined) {
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

  insets = $derived(this.#getProps().insets ?? this.stackInsets);

  getDimensions = $derived(
    createDimensionGetter(this.ctx, () => ({
      x: this.x,
      y: this.y,
      x1: this.x1,
      y1: this.y1,
      insets: this.insets,
    }))
  );

  scaleDimensions = $derived(
    this.getDimensions(this.#getProps().data) ?? { x: 0, y: 0, width: 0, height: 0 }
  );

  dimensions = $derived.by(() => {
    let { x, y, width, height } = this.scaleDimensions;
    const props = this.#getProps();

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
    const value = this.valueAccessor(this.#getProps().data);
    return Array.isArray(value) ? greatestAbs(value) : value;
  });

  /** Resolved `rounded="edge"` based on orientation and value */
  rounded = $derived.by(() => {
    const roundedProp = this.#getProps().rounded ?? 'all';
    if (roundedProp !== 'edge') return roundedProp;
    if (this.ctx.valueAxis === 'y') {
      return this.resolvedValue >= 0 && this.ctx.yRange[0] > this.ctx.yRange[1]
        ? 'top'
        : 'bottom';
    }
    return this.resolvedValue >= 0 && this.ctx.xRange[0] < this.ctx.xRange[1] ? 'right' : 'left';
  });

  corners = $derived.by<[number, number, number, number]>(() => {
    const radius = this.#getProps().radius ?? 0;
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
    const props = this.#getProps();
    return (
      props.initialY ??
      (props.motion && this.ctx.valueAxis === 'y'
        ? Math.max(this.ctx.yRange[0], this.ctx.yRange[1])
        : undefined)
    );
  });
  resolvedInitialHeight = $derived.by(() => {
    const props = this.#getProps();
    return props.initialHeight ?? (props.motion && this.ctx.valueAxis === 'y' ? 0 : undefined);
  });
  resolvedInitialX = $derived.by(() => {
    const props = this.#getProps();
    return (
      props.initialX ??
      (props.motion && this.ctx.valueAxis === 'x'
        ? Math.min(this.ctx.xRange[0], this.ctx.xRange[1])
        : undefined)
    );
  });
  resolvedInitialWidth = $derived.by(() => {
    const props = this.#getProps();
    return props.initialWidth ?? (props.motion && this.ctx.valueAxis === 'x' ? 0 : undefined);
  });
}
