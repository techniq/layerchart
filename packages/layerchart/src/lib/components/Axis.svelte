<script lang="ts">
  import { getContext, type ComponentProps } from 'svelte';
  import { fade } from 'svelte/transition';
  import { cubicIn } from 'svelte/easing';
  import type { SVGAttributes } from 'svelte/elements';
  import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';

  import { extent } from 'd3-array';
  import { pointRadial } from 'd3-shape';

  import { format as formatValue, type FormatType, cls, type TransitionParams } from 'svelte-ux';

  import Circle from './Circle.svelte';
  import Line from './Line.svelte';
  import Text from './Text.svelte';
  import { isScaleBand } from '$lib/utils/scales.js';

  const { xScale, yScale, xRange, yRange, width, height, padding } = getContext('LayerCake');

  /** Location of axis */
  export let placement: 'top' | 'bottom' | 'left' | 'right' | 'angle' | 'radius';

  /** Axis label */
  export let label = '';

  /** Location of axis label */
  export let labelPlacement: 'start' | 'middle' | 'end' = 'middle';

  /** Props applied label Text */
  export let labelProps: Partial<ComponentProps<Text>> | undefined = undefined;

  /** Draw a rule line.  Use Rule component for greater rendering order control */
  export let rule: boolean | SVGAttributes<SVGLineElement> = false;

  /** Draw a grid lines */
  export let grid: boolean | SVGAttributes<SVGLineElement> = false;

  /** Control the number of ticks*/
  export let ticks: number | any[] | Function | undefined =
    placement === 'left' || placement === 'right' ? 4 : undefined;

  /** Length of the tick line */
  export let tickLength = 4;

  /** Format tick labels */
  export let format: FormatType | undefined = undefined;

  /** Props to apply to each tick label */
  export let tickLabelProps: Partial<ComponentProps<Text>> | undefined = undefined;

  export let spring: boolean | Parameters<typeof springStore>[1] = undefined;
  export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

  export let transitionIn = tweened ? fade : () => {};
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

  $: [xRangeMin, xRangeMax] = extent($xRange);
  $: [yRangeMin, yRangeMax] = extent($yRange);

  $: tickVals = Array.isArray(ticks)
    ? ticks
    : typeof ticks === 'function'
      ? ticks(_scale)
      : isScaleBand(_scale)
        ? _scale.domain()
        : _scale.ticks(ticks);

  function getCoords(tick: any) {
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
          dy: -6, // manually adjusted until Text supports custom styles
        };

      case 'bottom':
        return {
          textAnchor: 'middle',
          verticalAnchor: 'start',
          dy: 4, // manually adjusted until Text supports custom styles
        };

      case 'left':
        return {
          textAnchor: 'end',
          verticalAnchor: 'middle',
          dx: -4,
          dy: -2, // manually adjusted until Text supports custom styles
        };

      case 'right':
        return {
          textAnchor: 'start',
          verticalAnchor: 'middle',
          dx: 4,
          dy: -2, // manually adjusted until Text supports custom styles
        };

      case 'angle':
        const xValue = _scale(tick);
        return {
          textAnchor:
            xValue === 0 || xValue === Math.PI ? 'middle' : xValue > Math.PI ? 'end' : 'start',
          verticalAnchor: 'middle',
          dx: 0,
          dy: -2, // manually adjusted until Text supports custom styles
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
</script>

<g class="Axis placement-{placement}">
  {#if rule !== false}
    {@const lineProps = typeof rule === 'object' ? rule : null}
    {#if orientation === 'vertical'}
      <Line
        x1={placement === 'right' ? xRangeMax : xRangeMin}
        x2={placement === 'right' ? xRangeMax : xRangeMin}
        y1={$yRange[0] || 0}
        y2={$yRange[1] || 0}
        {tweened}
        {spring}
        {...lineProps}
        class={cls('rule stroke-surface-content/50', lineProps?.class)}
      />
    {/if}

    {#if orientation === 'horizontal'}
      <Line
        x1={$xRange[0] || 0}
        x2={$xRange[1] || 0}
        y1={placement === 'top' ? yRangeMin : yRangeMax}
        y2={placement === 'top' ? yRangeMin : yRangeMax}
        {tweened}
        {spring}
        {...lineProps}
        class={cls('rule stroke-surface-content/50', lineProps?.class)}
      />
    {/if}

    <!-- TODO: angle rule? -->

    {#if orientation === 'radius'}
      <Circle
        r={$yRange[0] || 0}
        {tweened}
        {spring}
        {...lineProps}
        class={cls('rule stroke-surface-content/20 fill-none', lineProps?.class)}
      />
    {/if}
  {/if}

  {#if label}
    {@const resolvedLabelProps = {
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
        labelProps?.class
      ),
    }}

    <Text value={label} {...resolvedLabelProps} />
  {/if}

  {#each tickVals as tick, index (tick)}
    {@const tickCoords = getCoords(tick)}
    {@const radialTickCoords = pointRadial(tickCoords.x, tickCoords.y)}
    {@const resolvedTickLabelProps = {
      x: orientation === 'angle' ? radialTickCoords[0] : tickCoords.x,
      y: orientation === 'angle' ? radialTickCoords[1] : tickCoords.y,
      value: formatValue(tick, format ?? _scale.tickFormat?.() ?? ((v) => v)),
      ...getDefaultTickLabelProps(tick),
      tweened,
      spring,
      ...tickLabelProps,
      class: cls(
        'tickLabel text-[10px] stroke-surface-100 [stroke-width:2px] font-light',
        tickLabelProps?.class
      ),
    }}

    <g in:transitionIn={transitionInParams}>
      {#if grid !== false}
        {@const lineProps = typeof grid === 'object' ? grid : null}
        {#if orientation === 'horizontal'}
          <Line
            x1={tickCoords.x}
            y1={yRangeMin}
            x2={tickCoords.x}
            y2={yRangeMax}
            {tweened}
            {spring}
            {...lineProps}
            class={cls('grid stroke-surface-content/10', lineProps?.class)}
          />
        {:else if orientation === 'vertical'}
          <Line
            x1={0}
            y1={tickCoords.y}
            x2={$width}
            y2={tickCoords.y}
            {tweened}
            {spring}
            {...lineProps}
            class={cls('grid stroke-surface-content/10', lineProps?.class)}
          />
        {:else if orientation === 'angle'}
          {@const [x1, y1] = pointRadial(tickCoords.x, yRangeMin)}
          {@const [x2, y2] = pointRadial(tickCoords.x, yRangeMax)}

          <Line
            {x1}
            {y1}
            {x2}
            {y2}
            {tweened}
            {spring}
            {...lineProps}
            class={cls('test grid stroke-surface-content/10', lineProps?.class)}
          />
        {:else if orientation === 'radius'}
          <circle
            r={tickCoords.y}
            {...lineProps}
            class={cls('grid stroke-surface-content/10 fill-none', lineProps?.class)}
          />
        {/if}
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
          class="tick stroke-surface-content/50"
        />
      {:else if orientation === 'vertical'}
        <Line
          x1={tickCoords.x}
          y1={tickCoords.y}
          x2={tickCoords.x + (placement === 'left' ? -tickLength : tickLength)}
          y2={tickCoords.y}
          {tweened}
          {spring}
          class="tick stroke-surface-content/50"
        />
      {/if}

      <slot name="tickLabel" labelProps={resolvedTickLabelProps} {index}>
        <Text {...resolvedTickLabelProps} />
      </slot>
    </g>
  {/each}
</g>
