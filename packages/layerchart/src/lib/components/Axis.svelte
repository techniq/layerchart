<script lang="ts">
  import { type ComponentProps } from 'svelte';
  import { fade } from 'svelte/transition';
  import { cubicIn } from 'svelte/easing';
  import type { SVGAttributes } from 'svelte/elements';
  import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';
  import type { TimeInterval } from 'd3-time';

  import { extent } from 'd3-array';
  import { pointRadial } from 'd3-shape';

  import { format as formatValue, isLiteralObject, type FormatType } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';
  import type { TransitionParams } from 'svelte-ux'; // TODO: Replace with `@layerstack/svelte-types` or similar

  import { chartContext } from './ChartContext.svelte';
  import Line from './Line.svelte';
  import Rule from './Rule.svelte';
  import Text from './Text.svelte';
  import { isScaleBand, type AnyScale } from '$lib/utils/scales.js';

  const { xScale, yScale, xRange, yRange, width, height, padding } = chartContext();

  /** Location of axis */
  export let placement: 'top' | 'bottom' | 'left' | 'right' | 'angle' | 'radius';

  /** Axis label */
  export let label = '';

  /** Location of axis label */
  export let labelPlacement: 'start' | 'middle' | 'end' = 'middle';

  /** Props applied label Text */
  export let labelProps: Partial<ComponentProps<Text>> | undefined = undefined;

  /** Draw a rule line.  Use Rule component for greater rendering order control */
  export let rule: boolean | Partial<ComponentProps<Rule>> = false;

  /** Draw a grid lines */
  export let grid: boolean | Pick<SVGAttributes<SVGElement>, 'class' | 'style'> = false;

  /** Control the number of ticks*/
  export let ticks:
    | number
    | any[]
    | ((scale: AnyScale) => any)
    | { interval: TimeInterval | null }
    | null
    | undefined = undefined;

  /** Length of the tick line */
  export let tickLength = 4;

  /** Format tick labels */
  export let format: FormatType | undefined = undefined;

  /** Props to apply to each tick label */
  export let tickLabelProps: Partial<ComponentProps<Text>> | undefined = undefined;

  export let spring: boolean | Parameters<typeof springStore>[1] = undefined;
  export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

  export let transitionIn = tweened
    ? fade
    : () => {
        return {};
      };
  export let transitionInParams: TransitionParams = { easing: cubicIn };

  $: orientation =
    placement === 'angle'
      ? 'angle'
      : placement === 'radius'
        ? 'radius'
        : ['top', 'bottom'].includes(placement)
          ? 'horizontal'
          : 'vertical';

  export let scale: any = undefined;
  $: _scale = scale ?? (['horizontal', 'angle'].includes(orientation) ? $xScale : $yScale);

  export let classes: {
    root?: string;
    label?: string;
    rule?: string;
    tick?: string;
    tickLabel?: string;
  } = {};

  $: tickVals = Array.isArray(ticks)
    ? ticks
    : typeof ticks === 'function'
      ? ticks(_scale)
      : isLiteralObject(ticks)
        ? _scale.ticks(ticks.interval) // d3-time interval such as `timeDay.every(1)`
        : isScaleBand(_scale)
          ? ticks
            ? _scale.domain().filter((v: any, i: number) => i % ticks === 0)
            : _scale.domain()
          : _scale.ticks(ticks ?? (placement === 'left' || placement === 'right' ? 4 : undefined));

  function getCoords(tick: any, xRange: [number, number], yRange: [number, number]) {
    const [xRangeMin, xRangeMax] = extent(xRange) as [number, number];
    const [yRangeMin, yRangeMax] = extent(yRange) as [number, number];

    switch (placement) {
      case 'top':
        return {
          x: _scale(tick) + (isScaleBand(_scale) ? _scale.bandwidth() / 2 : 0),
          y: yRangeMin,
        };

      case 'bottom':
        return {
          x: _scale(tick) + (isScaleBand(_scale) ? _scale.bandwidth() / 2 : 0),
          y: yRangeMax,
        };

      case 'left':
        return {
          x: xRangeMin,
          y: _scale(tick) + (isScaleBand(_scale) ? _scale.bandwidth() / 2 : 0),
        };

      case 'right':
        return {
          x: xRangeMax,
          y: _scale(tick) + (isScaleBand(_scale) ? _scale.bandwidth() / 2 : 0),
        };

      case 'angle':
        return {
          x: _scale(tick),
          y: yRangeMax,
        };

      case 'radius':
        return {
          x: xRangeMin,
          y: _scale(tick),
        };
    }
  }

  function getDefaultTickLabelProps(tick: any): ComponentProps<Text> {
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
        const xValue = _scale(tick); // angle in radians
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

  $: resolvedLabelProps = {
    value: label,
    x:
      placement === 'left' || (orientation === 'horizontal' && labelPlacement === 'start')
        ? -$padding.left
        : placement === 'right' || (orientation === 'horizontal' && labelPlacement === 'end')
          ? $width + $padding.right
          : $width / 2,
    y:
      placement === 'top' || (orientation === 'vertical' && labelPlacement === 'start')
        ? -$padding.top
        : orientation === 'vertical' && labelPlacement === 'middle'
          ? $height / 2
          : placement === 'bottom' || labelPlacement === 'end'
            ? $height + $padding.bottom
            : 0,
    textAnchor:
      labelPlacement === 'middle'
        ? 'middle'
        : placement === 'right' || (orientation === 'horizontal' && labelPlacement === 'end')
          ? 'end'
          : 'start',
    verticalAnchor:
      placement === 'top' ||
      (orientation === 'vertical' && labelPlacement === 'start') ||
      (placement === 'left' && labelPlacement === 'middle')
        ? 'start'
        : 'end',
    rotate: orientation === 'vertical' && labelPlacement === 'middle' ? -90 : 0,
    capHeight: '.5rem', // text-[10px]
    ...labelProps,
    class: cls(
      'label text-[10px] stroke-surface-100 [stroke-width:2px] font-light',
      classes.label,
      labelProps?.class
    ),
  } satisfies ComponentProps<Text>;
</script>

<g class={cls('Axis placement-{placement}', classes.root, $$props.class)}>
  {#if rule !== false}
    {@const ruleProps = typeof rule === 'object' ? rule : null}
    <Rule
      x={placement === 'left' || placement === 'right' ? placement : placement === 'angle'}
      y={placement === 'top' || placement === 'bottom' ? placement : placement === 'radius'}
      {tweened}
      {spring}
      {...ruleProps}
      class={cls('rule stroke-surface-content/50', classes.rule, ruleProps?.class)}
    />
  {/if}

  {#if label}
    <Text {...resolvedLabelProps} />
  {/if}

  {#each tickVals as tick, index (tick)}
    {@const tickCoords = getCoords(tick, $xRange, $yRange)}
    {@const [radialTickCoordsX, radialTickCoordsY] = pointRadial(tickCoords.x, tickCoords.y)}
    {@const [radialTickMarkCoordsX, radialTickMarkCoordsY] = pointRadial(
      tickCoords.x,
      tickCoords.y + tickLength
    )}
    {@const resolvedTickLabelProps = {
      x: orientation === 'angle' ? radialTickCoordsX : tickCoords.x,
      y: orientation === 'angle' ? radialTickCoordsY : tickCoords.y,
      value: formatValue(tick, format ?? _scale.tickFormat?.() ?? ((v) => v)),
      ...getDefaultTickLabelProps(tick),
      tweened,
      spring,
      ...tickLabelProps,
      class: cls(
        'tickLabel text-[10px] stroke-surface-100 [stroke-width:2px] font-light',
        classes.tickLabel,
        tickLabelProps?.class
      ),
    }}

    <g in:transitionIn={transitionInParams}>
      {#if grid !== false}
        {@const ruleProps = typeof grid === 'object' ? grid : null}
        <Rule
          x={orientation === 'horizontal' || orientation === 'angle' ? tick : false}
          y={orientation === 'vertical' || orientation === 'radius' ? tick : false}
          {tweened}
          {spring}
          {...ruleProps}
          class={cls('grid stroke-surface-content/10', classes.rule, ruleProps?.class)}
        />
      {/if}

      <!-- Tick marks -->
      {#if orientation === 'horizontal'}
        <Line
          x1={tickCoords.x}
          y1={tickCoords.y}
          x2={tickCoords.x}
          y2={tickCoords.y + (placement === 'top' ? -tickLength : tickLength)}
          {tweened}
          {spring}
          class={cls('tick stroke-surface-content/50', classes.tick)}
        />
      {:else if orientation === 'vertical'}
        <Line
          x1={tickCoords.x}
          y1={tickCoords.y}
          x2={tickCoords.x + (placement === 'left' ? -tickLength : tickLength)}
          y2={tickCoords.y}
          {tweened}
          {spring}
          class={cls('tick stroke-surface-content/50', classes.tick)}
        />
      {:else if orientation === 'angle'}
        <Line
          x1={radialTickCoordsX}
          y1={radialTickCoordsY}
          x2={radialTickMarkCoordsX}
          y2={radialTickMarkCoordsY}
          {tweened}
          {spring}
          class={cls('tick stroke-surface-content/50', classes.tick)}
        />
      {/if}
      <!-- TODO: Add tick marks for radial (angle)? -->

      <slot name="tickLabel" labelProps={resolvedTickLabelProps} {index}>
        <Text {...resolvedTickLabelProps} />
      </slot>
    </g>
  {/each}
</g>
