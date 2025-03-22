<script lang="ts" module>
  import type { Transition, TransitionParams, Without } from '$lib/utils/types.js';

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
    label?: string | Snippet<[{ props: ComponentProps<typeof Text> }]>;

    /**
     * Location of axis label
     * @default 'middle'
     */
    labelPlacement?: 'start' | 'middle' | 'end';

    /**
     * Props applied to label Text
     */
    labelProps?: Partial<ComponentProps<typeof Text>>;

    /**
     * Draw a rule line. Use Rule component for greater rendering order control
     * @default false
     */
    rule?: boolean | Partial<ComponentProps<typeof Rule>>;

    /**
     * Draw grid lines
     * @default false
     */
    grid?: boolean | Pick<SVGAttributes<SVGElement>, 'class' | 'style'>;

    /**
     * Control the number of ticks
     */
    ticks?: number | any[] | ((scale: AnyScale) => any) | { interval: TimeInterval | null } | null;

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
    format?: FormatType;

    /**
     * Props to apply to each tick label
     */
    tickLabelProps?: Partial<ComponentProps<typeof Text>>;

    /**
     * A snippet to render your own custom tick label.
     */
    tickLabel?: Snippet<[{ props: ComponentProps<typeof Text>; index: number }]>;

    /**
     * Transition function for entering elements
     * @default tweened ? fade : () => ({})
     */
    transitionIn?: In;

    /**
     * Parameters for the transitionIn function
     * @default { easing: cubicIn }
     */
    transitionInParams?: TransitionParams<In>;

    /**
     * Scale for the axis
     */
    scale?: any;

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
  } & MotionProps;

  export type AxisProps<In extends Transition = Transition> = AxisPropsWithoutHTML<In> &
    Without<SVGAttributes<SVGGElement>, AxisPropsWithoutHTML<In>>;
</script>

<script lang="ts" generics="T extends Transition = Transition">
  import { type ComponentProps, type Snippet } from 'svelte';
  import { fade } from 'svelte/transition';
  import { cubicIn } from 'svelte/easing';
  import type { SVGAttributes } from 'svelte/elements';
  import type { TimeInterval } from 'd3-time';

  import { extent } from 'd3-array';
  import { pointRadial } from 'd3-shape';

  import { format as formatValue, isLiteralObject, type FormatType } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';

  import Line from './Line.svelte';
  import Rule from './Rule.svelte';
  import Text from './Text.svelte';
  import { isScaleBand, type AnyScale } from '$lib/utils/scales.svelte.js';
  import type { MotionProps } from '$lib/stores/motionState.svelte.js';
  import { getChartContext } from './Chart.svelte';
  import { createDataAttr } from '$lib/utils/attributes.js';

  let {
    placement,
    label = '',
    labelPlacement = 'middle',
    labelProps,
    rule = false,
    grid = false,
    ticks,
    tickLength = 4,
    tickMarks = true,
    format,
    tickLabelProps,
    spring,
    tweened,
    transitionIn: transitionInProp,
    transitionInParams: transitionInParamsProp,
    scale: scaleProp,
    classes = {},
    class: className,
    tickLabel,
    ...restProps
  }: AxisProps<T> = $props();

  const transitionIn = $derived(
    transitionInProp ? transitionInProp : tweened ? fade : () => {}
  ) as T;
  const transitionInParams = $derived(
    transitionInParamsProp ? transitionInParamsProp : { easing: cubicIn }
  );

  const ctx = getChartContext();

  const orientation = $derived(
    placement === 'angle'
      ? 'angle'
      : placement === 'radius'
        ? 'radius'
        : ['top', 'bottom'].includes(placement)
          ? 'horizontal'
          : 'vertical'
  );

  const scale = $derived(
    scaleProp ?? (['horizontal', 'angle'].includes(orientation) ? ctx.xScale : ctx.yScale)
  );

  const xRangeMinMax = $derived(extent<number>(ctx.xRange)) as [number, number];
  const yRangeMinMax = $derived(extent<number>(ctx.yRange)) as [number, number];

  const tickVals = $derived(
    Array.isArray(ticks)
      ? ticks
      : typeof ticks === 'function'
        ? ticks(scale)
        : isLiteralObject(ticks)
          ? scale.ticks(ticks.interval) // d3-time interval such as `timeDay.every(1)`
          : isScaleBand(scale)
            ? ticks
              ? scale.domain().filter((v: any, i: number) => i % ticks === 0)
              : scale.domain()
            : scale.ticks(ticks ?? (placement === 'left' || placement === 'right' ? 4 : undefined))
  );

  function getCoords(tick: any) {
    switch (placement) {
      case 'top':
        return {
          x: scale(tick) + (isScaleBand(scale) ? scale.bandwidth() / 2 : 0),
          y: yRangeMinMax[0],
        };

      case 'bottom':
        return {
          x: scale(tick) + (isScaleBand(scale) ? scale.bandwidth() / 2 : 0),
          y: yRangeMinMax[1],
        };

      case 'left':
        return {
          x: xRangeMinMax[0],
          y: scale(tick) + (isScaleBand(scale) ? scale.bandwidth() / 2 : 0),
        };

      case 'right':
        return {
          x: xRangeMinMax[1],
          y: scale(tick) + (isScaleBand(scale) ? scale.bandwidth() / 2 : 0),
        };

      case 'angle':
        return {
          x: scale(tick),
          y: yRangeMinMax[1],
        };

      case 'radius':
        return {
          x: xRangeMinMax[0],
          y: scale(tick),
        };
    }
  }

  function getDefaultTickLabelProps(tick: any): ComponentProps<typeof Text> {
    switch (placement) {
      case 'top':
        return {
          textAnchor: 'middle',
          verticalAnchor: 'end',
          dy: -tickLength - 2, // manually adjusted until Text supports custom styles
        };

      case 'bottom':
        return {
          textAnchor: 'middle',
          verticalAnchor: 'start',
          dy: tickLength, // manually adjusted until Text supports custom styles
        };

      case 'left':
        return {
          textAnchor: 'end',
          verticalAnchor: 'middle',
          dx: -tickLength,
          dy: -2, // manually adjusted until Text supports custom styles
        };

      case 'right':
        return {
          textAnchor: 'start',
          verticalAnchor: 'middle',
          dx: tickLength,
          dy: -2, // manually adjusted until Text supports custom styles
        };

      case 'angle':
        const xValue = scale(tick); // angle in radians
        return {
          textAnchor:
            xValue === 0 ||
            Math.abs(xValue - Math.PI) < 0.01 || // ~180deg
            Math.abs(xValue - Math.PI * 2) < 0.01 // ~360deg
              ? 'middle'
              : xValue > Math.PI
                ? 'end'
                : 'start',
          verticalAnchor: 'middle',
          dx: Math.sin(xValue) * (tickLength + 2),
          dy: -Math.cos(xValue) * (tickLength + 4), // manually adjusted until Text supports custom styles
        };

      case 'radius':
        return {
          textAnchor: 'middle',
          verticalAnchor: 'middle',
          dx: 2,
          dy: -2, // manually adjusted until Text supports custom styles
        };
    }
  }

  const resolvedLabelX = $derived.by(() => {
    if (placement === 'left' || (orientation === 'horizontal' && labelPlacement === 'start')) {
      return -ctx.padding.left;
    } else if (
      placement === 'right' ||
      (orientation === 'horizontal' && labelPlacement === 'end')
    ) {
      return ctx.width + ctx.padding.right;
    }

    return ctx.width / 2;
  });

  const resolvedLabelY = $derived.by(() => {
    if (placement === 'top' || (orientation === 'vertical' && labelPlacement === 'start')) {
      return -ctx.padding.top;
    } else if (orientation === 'vertical' && labelPlacement === 'middle') {
      return ctx.height / 2;
    } else if (placement === 'bottom' || labelPlacement === 'end') {
      return ctx.height + ctx.padding.bottom;
    }
    return '0';
  });

  const resolvedLabelTextAnchor = $derived.by(() => {
    if (labelPlacement === 'middle') {
      return 'middle';
    } else if (
      placement === 'right' ||
      (orientation === 'horizontal' && labelPlacement === 'end')
    ) {
      return 'end';
    }
    return 'start';
  });

  const resolvedLabelVerticalAnchor = $derived.by(() => {
    if (
      placement === 'top' ||
      (orientation === 'vertical' && labelPlacement === 'start') ||
      (placement === 'left' && labelPlacement === 'middle')
    ) {
      return 'start';
    }
    return 'end';
  });

  const resolvedLabelProps = $derived({
    value: typeof label === 'function' ? '' : undefined,
    x: resolvedLabelX,
    y: resolvedLabelY,
    textAnchor: resolvedLabelTextAnchor,
    verticalAnchor: resolvedLabelVerticalAnchor,
    rotate: orientation === 'vertical' && labelPlacement === 'middle' ? -90 : 0,
    capHeight: '.5rem', // text-[10px]
    ...createDataAttr('axis-label'),
    ...labelProps,
    class: cls(
      'text-[10px] stroke-surface-100 [stroke-width:2px] font-light',
      classes.label,
      labelProps?.class
    ),
  }) satisfies ComponentProps<typeof Text>;
</script>

<g
  {...restProps}
  {...createDataAttr('axis')}
  data-placement={placement}
  class={cls(`placement-${placement}`, classes.root, className)}
>
  {#if rule !== false}
    {@const ruleProps = typeof rule === 'object' ? rule : null}
    <Rule
      x={placement === 'left' || placement === 'right' ? placement : placement === 'angle'}
      y={placement === 'top' || placement === 'bottom' ? placement : placement === 'radius'}
      {tweened}
      {spring}
      {...ruleProps}
      {...createDataAttr('axis-rule')}
      class={cls('stroke-surface-content/50', classes.rule, ruleProps?.class)}
    />
  {/if}

  {#if typeof label === 'function'}
    {@render label({ props: resolvedLabelProps })}
  {:else if label}
    <Text {...resolvedLabelProps} />
  {/if}

  {#each tickVals as tick, index (tick)}
    {@const tickCoords = getCoords(tick)}
    {@const tickAttr = createDataAttr('axis-tick')}
    {@const [radialTickCoordsX, radialTickCoordsY] = pointRadial(tickCoords.x, tickCoords.y)}
    {@const [radialTickMarkCoordsX, radialTickMarkCoordsY] = pointRadial(
      tickCoords.x,
      tickCoords.y + tickLength
    )}
    {@const resolvedTickLabelProps = {
      x: orientation === 'angle' ? radialTickCoordsX : tickCoords.x,
      y: orientation === 'angle' ? radialTickCoordsY : tickCoords.y,
      value: formatValue(tick, format ?? scale.tickFormat?.() ?? ((v) => v)),
      ...getDefaultTickLabelProps(tick),
      tweened,
      spring,
      ...tickLabelProps,
      ...createDataAttr('axis-tick-label'),
      class: cls(
        'text-[10px] stroke-surface-100 [stroke-width:2px] font-light',
        classes.tickLabel,
        tickLabelProps?.class
      ),
    }}

    <g in:transitionIn={transitionInParams} {...createDataAttr('axis-tick-group')}>
      {#if grid !== false}
        {@const ruleProps = typeof grid === 'object' ? grid : null}
        <Rule
          x={orientation === 'horizontal' || orientation === 'angle' ? tick : false}
          y={orientation === 'vertical' || orientation === 'radius' ? tick : false}
          {tweened}
          {spring}
          {...ruleProps}
          {...createDataAttr('axis-grid')}
          class={cls('stroke-surface-content/10', classes.rule, ruleProps?.class)}
        />
      {/if}

      {#if tickMarks}
        <!-- Tick marks -->
        {#if orientation === 'horizontal'}
          <Line
            x1={tickCoords.x}
            y1={tickCoords.y}
            x2={tickCoords.x}
            y2={tickCoords.y + (placement === 'top' ? -tickLength : tickLength)}
            {tweened}
            {spring}
            {...tickAttr}
            class={cls('stroke-surface-content/50', classes.tick)}
          />
        {:else if orientation === 'vertical'}
          <Line
            x1={tickCoords.x}
            y1={tickCoords.y}
            x2={tickCoords.x + (placement === 'left' ? -tickLength : tickLength)}
            y2={tickCoords.y}
            {tweened}
            {spring}
            {...tickAttr}
            class={cls('stroke-surface-content/50', classes.tick)}
          />
        {:else if orientation === 'angle'}
          <Line
            x1={radialTickCoordsX}
            y1={radialTickCoordsY}
            x2={radialTickMarkCoordsX}
            y2={radialTickMarkCoordsY}
            {tweened}
            {spring}
            {...tickAttr}
            class={cls('stroke-surface-content/50', classes.tick)}
          />
        {/if}
      {/if}
      <!-- TODO: Add tick marks for radial (angle)? -->

      {#if tickLabel}
        {@render tickLabel({ props: resolvedTickLabelProps, index })}
      {:else}
        <Text {...resolvedTickLabelProps} />
      {/if}
    </g>
  {/each}
</g>
