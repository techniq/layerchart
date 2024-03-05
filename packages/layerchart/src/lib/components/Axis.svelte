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
  import { isScaleBand } from '$lib/utils/scales';

  const { xScale, yScale, xRange, yRange, width } = getContext('LayerCake');

  /** Location of axis */
  export let placement: 'top' | 'bottom' | 'left' | 'right' | 'angle' | 'radius';

  /** Draw a rule line.  Use Rule component for greater rendering order control */
  export let rule: boolean | SVGAttributes<SVGLineElement> = false;

  /** Draw a grid lines */
  export let grid: boolean | SVGAttributes<SVGLineElement> = false;

  /** Control the number of ticks*/
  export let ticks: number | any[] | Function | undefined =
    placement === 'left' || placement === 'right' ? 4 : undefined;

  /** Length of the tick line */
  export let tickSize = 4;
  export let format: FormatType = undefined;
  export let labelProps: Partial<ComponentProps<Text>> | undefined = undefined;

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
  $: scale = ['horizontal', 'angle'].includes(orientation) ? $xScale : $yScale;

  $: [xRangeMin, xRangeMax] = extent($xRange);
  $: [yRangeMin, yRangeMax] = extent($yRange);

  $: tickVals = Array.isArray(ticks)
    ? ticks
    : isScaleBand(scale)
      ? scale.domain()
      : scale.ticks(typeof ticks === 'function' ? ticks(scale) : ticks);

  function getCoords(tick: any) {
    switch (placement) {
      case 'top':
        return {
          x: $xScale(tick) + (isScaleBand($xScale) ? $xScale.bandwidth() / 2 : 0),
          y: xRangeMin,
        };

      case 'bottom':
        return {
          x: $xScale(tick) + (isScaleBand($xScale) ? $xScale.bandwidth() / 2 : 0),
          y: yRangeMax,
        };

      case 'left':
        return {
          x: xRangeMin,
          y: $yScale(tick) + (isScaleBand($yScale) ? $yScale.bandwidth() / 2 : 0),
        };

      case 'right':
        return {
          x: xRangeMax,
          y: $yScale(tick) + (isScaleBand($yScale) ? $yScale.bandwidth() / 2 : 0),
        };

      case 'angle':
        return {
          x: $xScale(tick),
          y: yRangeMax,
        };

      case 'radius':
        return {
          x: xRangeMin,
          y: $yScale(tick),
        };
    }
  }

  function getDefaultLabelProps(tick: any): ComponentProps<Text> {
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
        const xValue = $xScale(tick);
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

  {#each tickVals as tick (tick)}
    {@const tickCoords = getCoords(tick)}
    {@const radialTickCoords = pointRadial(tickCoords.x, tickCoords.y)}

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
          y2={tickCoords.y + (placement === 'top' ? -tickSize : tickSize)}
          {tweened}
          {spring}
          class="tick stroke-surface-content/50"
        />
      {:else if orientation === 'vertical'}
        <Line
          x1={tickCoords.x}
          y1={tickCoords.y}
          x2={tickCoords.x + (placement === 'left' ? -tickSize : tickSize)}
          y2={tickCoords.y}
          {tweened}
          {spring}
          class="tick stroke-surface-content/50"
        />
      {/if}

      <Text
        x={orientation === 'angle' ? radialTickCoords[0] : tickCoords.x}
        y={orientation === 'angle' ? radialTickCoords[1] : tickCoords.y}
        value={formatValue(tick, format ?? scale.tickFormat?.() ?? ((v) => v))}
        {...getDefaultLabelProps(tick)}
        {tweened}
        {spring}
        {...labelProps}
        class={cls(
          'label text-[10px] stroke-surface-100 [stroke-width:2px] font-light',
          labelProps?.class
        )}
      />
    </g>
  {/each}
</g>
