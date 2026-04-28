import type { ComponentProps, Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';

import { extent } from 'd3-array';
import { pointRadial } from 'd3-shape';
import { timeDay, timeHour, timeMillisecond, timeMinute, timeSecond, timeYear } from 'd3-time';

import { type FormatType, type FormatConfig, unique, PeriodType } from '@layerstack/utils';
import { cls } from '@layerstack/tailwind';

import type { Transition, TransitionParams, Without } from '$lib/utils/types.js';
import type { GroupProps } from '../Group/Group.shared.svelte.js';
import type { TextProps } from '../Text/Text.shared.svelte.js';
import type Rule from '../Rule.svelte';
import { isScaleBand } from '$lib/utils/scales.svelte.js';
import { getChartContext } from '$lib/contexts/chart.js';
import type { ChartState } from '$lib/states/chart.svelte.js';
import { type MotionProp } from '$lib/utils/motion.svelte.js';
import { autoTickVals, autoTickFormat, type TicksConfig } from '$lib/utils/ticks.js';

export type AxisPropsWithoutHTML<In extends Transition = Transition> = {
  /**
   * Location of axis
   */
  placement: 'top' | 'bottom' | 'left' | 'right' | 'angle' | 'radius';

  /**
   * The label for the axis.
   *
   * Can either be a string or a snippet to render custom content.
   * The snippet receives spreadable props to apply to the label.
   */
  label?: string | Snippet<[{ props: TextProps }]>;

  /**
   * Location of axis label
   * @default 'middle'
   */
  labelPlacement?: 'start' | 'middle' | 'end';

  /**
   * Props applied to label Text
   */
  labelProps?: Partial<TextProps>;

  /**
   * Draw a rule line. Use Rule component for greater rendering order control
   * @default false
   */
  rule?: boolean | Partial<ComponentProps<typeof Rule>>;

  /**
   * Draw grid lines. Pass props (class, style, stroke, strokeWidth, opacity,
   * dashArray) to forward onto the underlying grid line.
   * @default false
   */
  grid?:
    | boolean
    | (Pick<SVGAttributes<SVGElement>, 'class' | 'style'> & {
        stroke?: string;
        strokeWidth?: number;
        opacity?: number;
        dashArray?: number | number[] | string;
      });

  /**
   * Control the number of ticks
   */
  ticks?: TicksConfig;

  /**
   * Width or height of each tick in pixels (enabling responsive count)
   * @default 80 (top|bottom|angle) or 50 (left|right|radius)
   */
  tickSpacing?: number | null;

  /**
   * Whether to render tick labels on multiple lines for additional context
   *
   * @default false
   */
  tickMultiline?: boolean;

  /**
   * Length of the tick line
   * @default 4
   */
  tickLength?: number;

  /**
   * Whether to render tick marks.
   *
   * @default true
   */
  tickMarks?: boolean;

  /**
   * Format tick labels
   */
  format?: FormatType | FormatConfig;

  /**
   * Props to apply to each tick label
   */
  tickLabelProps?: Partial<TextProps>;

  /**
   * A snippet to render your own custom tick label.
   */
  tickLabel?: Snippet<[{ props: TextProps; index: number }]>;

  /**
   * Transition function for entering elements
   * @default defaults to fade if the motion prop is set to tweened
   */
  transitionIn?: In;

  /**
   * Parameters for the transitionIn function
   * @default { easing: cubicIn }
   */
  transitionInParams?: TransitionParams<In>;

  /**
   * Override scale for the axis
   */
  scale?: any;

  /**
   * Stroke color for axis rule, grid lines, and tick marks.
   * Useful for server-side rendering where CSS variables are not available.
   */
  stroke?: string;

  /**
   * Fill color for tick labels and axis label.
   * Useful for server-side rendering where CSS variables are not available.
   */
  fill?: string;

  /**
   * Classes for styling various parts of the axis
   * @default {}
   */
  classes?: {
    root?: string;
    label?: string;
    rule?: string;
    tick?: string;
    tickLabel?: string;
  };

  motion?: MotionProp;
};

export type AxisProps<In extends Transition = Transition> = AxisPropsWithoutHTML<In> &
  Without<GroupProps, AxisPropsWithoutHTML<In>>;

export type AxisTickItem = {
  key: number;
  tick: any;
  tickCoordsX: number;
  tickCoordsY: number;
  radialTickCoordsX: number;
  radialTickCoordsY: number;
  radialTickMarkCoordsX: number;
  radialTickMarkCoordsY: number;
  tickLabelProps: TextProps;
};

/**
 * Reactive state shared by every per-layer Axis variant.
 */
export class AxisState {
  #getProps: () => AxisProps = () => ({}) as AxisProps;
  ctx: ChartState = getChartContext();

  constructor(getProps: () => AxisProps) {
    this.#getProps = getProps;
    this.ctx.registerComponent({ name: 'Axis', kind: 'composite-mark' });
  }

  // --- Derived from placement ---

  orientation = $derived.by(() => {
    const placement = this.#getProps().placement;
    return placement === 'angle'
      ? 'angle'
      : placement === 'radius'
        ? 'radius'
        : ['top', 'bottom'].includes(placement)
          ? 'horizontal'
          : 'vertical';
  });

  scale = $derived.by(() => {
    const scaleProp = this.#getProps().scale;
    return scaleProp ?? (['horizontal', 'angle'].includes(this.orientation) ? this.ctx.xScale : this.ctx.yScale);
  });

  interval = $derived(
    ['horizontal', 'angle'].includes(this.orientation) ? this.ctx.xInterval : this.ctx.yInterval
  );

  defaultTickSpacing = $derived.by(() => {
    const placement = this.#getProps().placement;
    return ['top', 'bottom', 'angle'].includes(placement)
      ? 80
      : ['left', 'right', 'radius'].includes(placement)
        ? 50
        : undefined;
  });

  tickSpacing = $derived.by(() => {
    const tickSpacingProp = this.#getProps().tickSpacing;
    if (tickSpacingProp !== undefined) return tickSpacingProp;
    if (isScaleBand(this.scale) && this.interval == null) return null;
    return this.defaultTickSpacing;
  });

  resolvedFormat = $derived.by(() => {
    const format = this.#getProps().format;
    if (format !== undefined) return format;

    if (this.ctx.series.stackLayout === 'stackExpand') {
      const isValueAxis =
        (this.ctx.valueAxis === 'x' && ['horizontal', 'angle'].includes(this.orientation)) ||
        (this.ctx.valueAxis === 'y' && ['vertical', 'radius'].includes(this.orientation));
      if (isValueAxis) {
        return 'percentRound';
      }
    }

    return undefined;
  });

  xRangeMinMax = $derived(extent<number>(this.ctx.xRange) as [number, number]);
  yRangeMinMax = $derived(extent<number>(this.ctx.yRange) as [number, number]);

  ctxSize = $derived.by(() => {
    if (this.orientation === 'vertical') return this.ctx.height;
    if (this.orientation === 'horizontal') return this.ctx.width;
    if (this.orientation === 'radius') return this.ctx.height / 2;
    if (this.orientation === 'angle') return this.ctx.width;
    return null;
  });

  // For band scales with domain-mode transform, scale up effective size by the zoom factor
  // so that more tick labels appear as bands get wider when zoomed in
  effectiveSize = $derived.by(() => {
    if (!this.ctxSize) return this.ctxSize;
    const ts = this.ctx.transformState;
    if (ts?.mode === 'domain' && isScaleBand(this.scale) && ts.scale > 1) {
      return this.ctxSize * ts.scale;
    }
    return this.ctxSize;
  });

  tickCount = $derived.by(() => {
    const ticks = this.#getProps().ticks;
    if (typeof ticks === 'number') return ticks;
    if (this.tickSpacing && this.effectiveSize) return Math.round(this.effectiveSize / this.tickSpacing);
    return undefined;
  });

  formatCount = $derived.by(() => {
    const ticks = this.#getProps().ticks;
    if (typeof ticks === 'number') return ticks;
    if (this.defaultTickSpacing && this.effectiveSize) return Math.round(this.effectiveSize / this.defaultTickSpacing);
    return undefined;
  });

  tickVals = $derived.by(() => {
    const ticks = this.#getProps().ticks;
    let tickVals = autoTickVals(this.scale, ticks, this.tickCount);

    if (this.interval != null) {
      // Remove last tick when interval is provided (such as for bar charts with center aligned (offset) ticks)
      tickVals.pop();
    }

    // Use format to filter ticks (helpful to keep ticks above a threshold for wide charts or short durations)
    const formatType =
      typeof this.resolvedFormat === 'object' ? this.resolvedFormat?.type : this.resolvedFormat;

    if (formatType === 'integer') {
      tickVals = tickVals.filter(Number.isInteger);
    } else if (formatType === 'year' || formatType === PeriodType.CalendarYear) {
      tickVals = tickVals.filter((val) => +timeYear.floor(val) === +val);
    } else if (
      formatType === 'month' ||
      formatType === PeriodType.Month ||
      formatType === PeriodType.MonthYear
    ) {
      tickVals = tickVals.filter((val) => val.getDate() < 7); // first week of the month
    } else if (formatType === 'day' || formatType === PeriodType.Day) {
      tickVals = tickVals.filter((val) => +timeDay.floor(val) === +val);
    } else if (formatType === 'hour' || formatType === PeriodType.Hour) {
      tickVals = tickVals.filter((val) => +timeHour.floor(val) === +val);
    } else if (formatType === 'minute' || formatType === PeriodType.Minute) {
      tickVals = tickVals.filter((val) => +timeMinute.floor(val) === +val);
    } else if (formatType === 'second' || formatType === PeriodType.Second) {
      tickVals = tickVals.filter((val) => +timeSecond.floor(val) === +val);
    } else if (formatType === 'millisecond' || formatType === PeriodType.Millisecond) {
      tickVals = tickVals.filter((val) => +timeMillisecond.floor(val) === +val);
    }

    return unique(tickVals);
  });

  tickFormat = $derived.by(() =>
    autoTickFormat({
      scale: this.scale,
      ticks: this.#getProps().ticks,
      count: this.formatCount,
      formatType: this.resolvedFormat,
      multiline: this.#getProps().tickMultiline ?? false,
      placement: this.#getProps().placement,
    })
  );

  getCoords(tick: any): { x: number; y: number } {
    const placement = this.#getProps().placement;
    const scale = this.scale;
    switch (placement) {
      case 'top':
      case 'bottom':
        return {
          x:
            scale(tick) +
            (isScaleBand(scale)
              ? scale.bandwidth() / 2
              : this.ctx.xInterval
                ? (scale(this.ctx.xInterval.offset(tick)) - scale(tick)) / 2
                : 0),
          y: placement === 'top' ? this.yRangeMinMax[0] : this.yRangeMinMax[1],
        };

      case 'left':
      case 'right':
        return {
          x: placement === 'left' ? this.xRangeMinMax[0] : this.xRangeMinMax[1],
          y:
            scale(tick) +
            (isScaleBand(scale)
              ? scale.bandwidth() / 2
              : this.ctx.yInterval
                ? (scale(this.ctx.yInterval.offset(tick)) - scale(tick)) / 2
                : 0),
        };

      case 'angle':
        return {
          x: scale(tick),
          y: this.yRangeMinMax[1],
        };

      case 'radius':
        return {
          x: this.xRangeMinMax[0],
          y: scale(tick) + (isScaleBand(scale) ? scale.bandwidth() / 2 : 0),
        };
    }
    return { x: 0, y: 0 };
  }

  getDefaultTickLabelProps(tick: any): Partial<TextProps> {
    const { placement, tickLength = 4 } = this.#getProps();
    switch (placement) {
      case 'top':
        return {
          textAnchor: 'middle',
          verticalAnchor: 'end',
          dy: -tickLength,
        };

      case 'bottom':
        return {
          textAnchor: 'middle',
          verticalAnchor: 'start',
          dy: tickLength,
        };

      case 'left':
        return {
          textAnchor: 'end',
          verticalAnchor: 'middle',
          dx: -tickLength,
        };

      case 'right':
        return {
          textAnchor: 'start',
          verticalAnchor: 'middle',
          dx: tickLength,
        };

      case 'angle': {
        const xValue = this.scale(tick);
        return {
          textAnchor:
            xValue === 0 ||
            Math.abs(xValue - Math.PI) < 0.01 ||
            Math.abs(xValue - Math.PI * 2) < 0.01
              ? 'middle'
              : xValue > Math.PI
                ? 'end'
                : 'start',
          verticalAnchor: 'middle',
          dx: Math.sin(xValue) * tickLength,
          dy: -Math.cos(xValue) * (tickLength + 4),
        };
      }

      case 'radius':
        return {
          textAnchor: 'middle',
          verticalAnchor: 'middle',
          dx: 2,
        };
    }
    return {};
  }

  resolvedLabelX = $derived.by(() => {
    const { placement, labelPlacement = 'middle' } = this.#getProps();
    if (placement === 'left' || (this.orientation === 'horizontal' && labelPlacement === 'start')) {
      return -this.ctx.padding.left;
    } else if (
      placement === 'right' ||
      (this.orientation === 'horizontal' && labelPlacement === 'end')
    ) {
      return this.ctx.width + this.ctx.padding.right;
    }
    return this.ctx.width / 2;
  });

  resolvedLabelY = $derived.by(() => {
    const { placement, labelPlacement = 'middle' } = this.#getProps();
    if (placement === 'top' || (this.orientation === 'vertical' && labelPlacement === 'start')) {
      return -this.ctx.padding.top;
    } else if (this.orientation === 'vertical' && labelPlacement === 'middle') {
      return this.ctx.height / 2;
    } else if (placement === 'bottom' || labelPlacement === 'end') {
      return this.ctx.height + this.ctx.padding.bottom;
    }
    return '0';
  });

  resolvedLabelTextAnchor = $derived.by(() => {
    const { placement, labelPlacement = 'middle' } = this.#getProps();
    if (labelPlacement === 'middle') return 'middle';
    if (placement === 'right' || (this.orientation === 'horizontal' && labelPlacement === 'end'))
      return 'end';
    return 'start';
  });

  resolvedLabelVerticalAnchor = $derived.by(() => {
    const { placement, labelPlacement = 'middle' } = this.#getProps();
    if (
      placement === 'top' ||
      (this.orientation === 'vertical' && labelPlacement === 'start') ||
      (placement === 'left' && labelPlacement === 'middle')
    ) {
      return 'start';
    }
    return 'end';
  });

  resolvedLabelProps = $derived.by(() => {
    const {
      label = '',
      labelPlacement = 'middle',
      labelProps,
      stroke,
      fill,
      classes = {},
    } = this.#getProps();
    return {
      value: typeof label === 'function' ? '' : label,
      x: this.resolvedLabelX,
      y: this.resolvedLabelY,
      textAnchor: this.resolvedLabelTextAnchor,
      verticalAnchor: this.resolvedLabelVerticalAnchor,
      rotate: this.orientation === 'vertical' && labelPlacement === 'middle' ? -90 : 0,
      capHeight: '7px',
      lineHeight: '11px',
      fill,
      stroke,
      ...labelProps,
      class: cls('lc-axis-label', classes.label, labelProps?.class),
    } as TextProps;
  });

  tickItems = $derived.by<AxisTickItem[]>(() => {
    const {
      motion,
      stroke,
      fill,
      tickLabelProps,
      classes = {},
    } = this.#getProps();
    return this.tickVals.map((tick, index) => {
      const tickCoords = this.getCoords(tick);
      const [radialTickCoordsX, radialTickCoordsY] = pointRadial(tickCoords.x, tickCoords.y);
      const [radialTickMarkCoordsX, radialTickMarkCoordsY] = pointRadial(
        tickCoords.x,
        tickCoords.y + (this.#getProps().tickLength ?? 4)
      );
      const labelProps: TextProps = {
        x: this.orientation === 'angle' ? radialTickCoordsX : tickCoords.x,
        y: this.orientation === 'angle' ? radialTickCoordsY : tickCoords.y,
        value: this.tickFormat(tick, index),
        ...this.getDefaultTickLabelProps(tick),
        motion,
        capHeight: '7px',
        lineHeight: '11px',
        fill,
        stroke,
        ...tickLabelProps,
        class: cls('lc-axis-tick-label', classes.tickLabel, tickLabelProps?.class),
      } as TextProps;

      return {
        key: tick.valueOf(),
        tick,
        tickCoordsX: tickCoords.x,
        tickCoordsY: tickCoords.y,
        radialTickCoordsX,
        radialTickCoordsY,
        radialTickMarkCoordsX,
        radialTickMarkCoordsY,
        tickLabelProps: labelProps,
      };
    });
  });
}
