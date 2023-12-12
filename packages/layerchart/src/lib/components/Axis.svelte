<script lang="ts">
  import { getContext, type ComponentProps } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import { format as formatValue, type FormatType, cls } from 'svelte-ux';
  import { extent } from 'd3-array';

  import Text from './Text.svelte';
  import { isScaleBand } from '$lib/utils/scales';

  const { xScale, yScale, xRange, yRange, width } = getContext('LayerCake');

  /** Location of axis */
  export let placement: 'top' | 'bottom' | 'left' | 'right';

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
  export let labelProps: ComponentProps<Text> | undefined = undefined;

  $: orientation = ['top', 'bottom'].includes(placement) ? 'horizontal' : 'vertical';
  $: scale = orientation === 'horizontal' ? $xScale : $yScale;

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
    }
  }

  function getDefaultLabelProps(): ComponentProps<Text> {
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
    }
  }
</script>

<g class="Axis placement-{placement}">
  {#if rule !== false}
    {@const lineProps = typeof rule === 'object' ? rule : null}
    {#if orientation === 'vertical'}
      <line
        x1={placement === 'right' ? xRangeMax : xRangeMin}
        x2={placement === 'right' ? xRangeMax : xRangeMin}
        y1={$yRange[0] || 0}
        y2={$yRange[1] || 0}
        {...lineProps}
        class={cls('rule stroke-surface-content/50', lineProps?.class)}
      />
    {/if}

    {#if orientation === 'horizontal'}
      <line
        x1={$xRange[0] || 0}
        x2={$xRange[1] || 0}
        y1={placement === 'top' ? yRangeMin : yRangeMax}
        y2={placement === 'top' ? yRangeMin : yRangeMax}
        {...lineProps}
        class={cls('rule stroke-surface-content/50', lineProps?.class)}
      />
    {/if}
  {/if}

  {#each tickVals as tick, i}
    {@const tickCoords = getCoords(tick)}
    <g>
      {#if grid !== false}
        {@const lineProps = typeof grid === 'object' ? grid : null}
        {#if orientation === 'horizontal'}
          <line
            x1={tickCoords.x}
            y1={yRangeMin}
            x2={tickCoords.x}
            y2={yRangeMax}
            {...lineProps}
            class={cls('grid stroke-surface-content/10', lineProps?.class)}
          />
        {:else if orientation === 'vertical'}
          <line
            x1={0}
            y1={tickCoords.y}
            x2={$width}
            y2={tickCoords.y}
            {...lineProps}
            class={cls('grid stroke-surface-content/10', lineProps?.class)}
          />
        {/if}
      {/if}

      <!-- Tick marks -->
      {#if orientation === 'horizontal'}
        <line
          x1={tickCoords.x}
          y1={tickCoords.y}
          x2={tickCoords.x}
          y2={tickCoords.y + (placement === 'top' ? -tickSize : tickSize)}
          class="tick stroke-surface-content/50"
        />
      {:else if orientation === 'vertical'}
        <line
          x1={tickCoords.x}
          y1={tickCoords.y}
          x2={tickCoords.x + (placement === 'left' ? -tickSize : tickSize)}
          y2={tickCoords.y}
          class="tick stroke-surface-content/50"
        />
      {/if}

      <Text
        x={tickCoords.x}
        y={tickCoords.y}
        value={formatValue(tick, format ?? scale.tickFormat?.())}
        {...getDefaultLabelProps()}
        {...labelProps}
        class={cls(
          'label text-[10px] stroke-surface-100 [stroke-width:2px] font-light',
          labelProps?.class
        )}
      />
    </g>
  {/each}
</g>
