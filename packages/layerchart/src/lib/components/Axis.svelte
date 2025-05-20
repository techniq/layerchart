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
    ticks?: TicksConfig;

    /**
     * Width or height of each tick in pxiels (responsive reduce)
     */
    tickSpacing?: number;

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
     * @default defaults to fade if the motion prop is set to tweened
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

    motion?: MotionProp;
  };

  export type AxisProps<In extends Transition = Transition> = AxisPropsWithoutHTML<In> &
    Without<GroupProps, AxisPropsWithoutHTML<In>>;
</script>

<script lang="ts" generics="T extends Transition = Transition">
  import { type ComponentProps, type Snippet } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';

  import { extent } from 'd3-array';
  import { pointRadial } from 'd3-shape';

  import { type FormatType } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';

  import Group, { type GroupProps } from './Group.svelte';
  import Line from './Line.svelte';
  import Rule from './Rule.svelte';
  import Text from './Text.svelte';
  import { isScaleBand } from '$lib/utils/scales.svelte.js';

  import { getChartContext } from './Chart.svelte';
  import { extractLayerProps, layerClass } from '$lib/utils/attributes.js';
  import { type MotionProp } from '$lib/utils/motion.svelte.js';
  import { resolveTickFormat, resolveTickVals, type TicksConfig } from '$lib/utils/ticks.js';

  let {
    placement,
    label = '',
    labelPlacement = 'middle',
    labelProps,
    rule = false,
    grid = false,
    ticks,
    tickSpacing = ['top', 'bottom'].includes(placement)
      ? 80
      : ['left', 'right'].includes(placement)
        ? 50
        : undefined,
    tickMultiline = false,
    tickLength = 4,
    tickMarks = true,
    format,
    tickLabelProps,
    motion,
    transitionIn,
    transitionInParams,
    scale: scaleProp,
    classes = {},
    class: className,
    tickLabel,
    ...restProps
  }: AxisProps<T> = $props();

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

  // TODO: Handle radial orientation;
  const ctxSize = $derived(
    orientation === 'vertical' ? ctx.height : orientation === 'horizontal' ? ctx.width : null
  );

  // TODO: Handle vertical orientation (placement === 'left' | right')?  Previously used `4` but could use `tickSpacing = 50` or similar
  const tickCount = $derived(
    typeof ticks === 'number'
      ? ticks
      : tickSpacing && ctxSize
        ? Math.round(ctxSize / tickSpacing)
        : undefined
  );
  const tickVals = $derived(resolveTickVals(scale, ticks, tickCount));
  const tickFormat = $derived(resolveTickFormat(scale, format, tickCount, tickMultiline));

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
          y: scale(tick) + (isScaleBand(scale) ? scale.bandwidth() / 2 : 0),
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
    ...labelProps,
    class: cls(
      layerClass('axis-label'),
      'text-[10px] stroke-surface-100 [stroke-width:2px] font-light',
      classes.label,
      labelProps?.class
    ),
  }) satisfies ComponentProps<typeof Text>;
</script>

<Group
  {...restProps}
  data-placement={placement}
  class={cls(layerClass('axis'), `placement-${placement}`, classes.root, className)}
>
  {#if rule !== false}
    {@const ruleProps = extractLayerProps(rule, 'axis-rule')}
    <Rule
      x={placement === 'left' || placement === 'right' ? placement : placement === 'angle'}
      y={placement === 'top' || placement === 'bottom' ? placement : placement === 'radius'}
      {motion}
      {...ruleProps}
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
    {@const [radialTickCoordsX, radialTickCoordsY] = pointRadial(tickCoords.x, tickCoords.y)}
    {@const [radialTickMarkCoordsX, radialTickMarkCoordsY] = pointRadial(
      tickCoords.x,
      tickCoords.y + tickLength
    )}
    {@const resolvedTickLabelProps = {
      x: orientation === 'angle' ? radialTickCoordsX : tickCoords.x,
      y: orientation === 'angle' ? radialTickCoordsY : tickCoords.y,
      value: tickFormat(tick, index),
      ...getDefaultTickLabelProps(tick),
      motion,
      ...tickLabelProps,
      class: cls(
        layerClass('axis-tick-label'),
        'text-[10px] stroke-surface-100 [stroke-width:2px] font-light',
        classes.tickLabel,
        tickLabelProps?.class
      ),
    }}

    <Group {transitionIn} {transitionInParams} class={layerClass('axis-tick-group')}>
      {#if grid !== false}
        {@const ruleProps = extractLayerProps(grid, 'axis-grid')}
        <Rule
          x={orientation === 'horizontal' || orientation === 'angle' ? tick : false}
          y={orientation === 'vertical' || orientation === 'radius' ? tick : false}
          {motion}
          {...ruleProps}
          class={cls('stroke-surface-content/10', classes.rule, ruleProps?.class)}
        />
      {/if}

      {#if tickMarks}
        {@const tickClasses = cls(
          layerClass('axis-tick'),
          'stroke-surface-content/50',
          classes.tick
        )}
        {#if orientation === 'horizontal'}
          <Line
            x1={tickCoords.x}
            y1={tickCoords.y}
            x2={tickCoords.x}
            y2={tickCoords.y + (placement === 'top' ? -tickLength : tickLength)}
            {motion}
            class={tickClasses}
          />
        {:else if orientation === 'vertical'}
          <Line
            x1={tickCoords.x}
            y1={tickCoords.y}
            x2={tickCoords.x + (placement === 'left' ? -tickLength : tickLength)}
            y2={tickCoords.y}
            {motion}
            class={tickClasses}
          />
        {:else if orientation === 'angle'}
          <Line
            x1={radialTickCoordsX}
            y1={radialTickCoordsY}
            x2={radialTickMarkCoordsX}
            y2={radialTickMarkCoordsY}
            {motion}
            class={tickClasses}
          />
        {/if}
      {/if}

      {#if tickLabel}
        {@render tickLabel({ props: resolvedTickLabelProps, index })}
      {:else}
        <Text {...resolvedTickLabelProps} />
      {/if}
    </Group>
  {/each}
</Group>
