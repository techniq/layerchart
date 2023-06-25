<script lang="ts">
  import { getContext, type ComponentProps } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import { format as formatValue, type FormatType } from 'svelte-ux';
  import { max, min } from 'd3-array';

  import Text from './Text.svelte';
  import { isScaleBand } from '$lib/utils/scales';

  const { xScale, yScale, xRange, yRange, width } = getContext('LayerCake');

  export let placement: 'top' | 'bottom' | 'left' | 'right';

  /** Control the number of ticks*/
  export let ticks: number | Function | undefined =
    placement === 'left' || placement === 'right' ? 4 : undefined;

  export let gridlines: boolean | SVGAttributes<SVGLineElement> = false;
  export let tickSize = 4;
  export let format: FormatType = undefined;
  export let labelProps: ComponentProps<Text> | undefined = undefined;

  $: orientation = ['top', 'bottom'].includes(placement) ? 'horizontal' : 'vertical';
  $: scale = orientation === 'horizontal' ? $xScale : $yScale;

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
          y: min($yRange)
        };

      case 'bottom':
        return {
          x: $xScale(tick) + (isScaleBand($xScale) ? $xScale.bandwidth() / 2 : 0),
          y: max($yRange)
        };

      case 'left':
        return {
          x: min($xRange),
          y: $yScale(tick) + (isScaleBand($yScale) ? $yScale.bandwidth() / 2 : 0)
        };

      case 'right':
        return {
          x: max($xRange),
          y: $yScale(tick) + (isScaleBand($yScale) ? $yScale.bandwidth() / 2 : 0)
        };
    }
  }

  function getDefaultLabelProps(): ComponentProps<Text> {
    switch (placement) {
      case 'top':
        return {
          textAnchor: 'middle',
          verticalAnchor: 'end',
          dy: -6 // manually adjusted until Text supports custom styles
        };

      case 'bottom':
        return {
          textAnchor: 'middle',
          verticalAnchor: 'start',
          dy: 4 // manually adjusted until Text supports custom styles
        };

      case 'left':
        return {
          textAnchor: 'end',
          verticalAnchor: 'middle',
          dx: -4,
          dy: -2 // manually adjusted until Text supports custom styles
        };

      case 'right':
        return {
          textAnchor: 'start',
          verticalAnchor: 'middle',
          dx: 4,
          dy: -2 // manually adjusted until Text supports custom styles
        };
    }
  }
</script>

<g class="Axis placement-{placement}">
  {#each tickVals as tick, i}
    {@const tickCoords = getCoords(tick)}
    <g>
      {#if gridlines !== false}
        {#if orientation === 'horizontal'}
          <line
            x1={tickCoords.x}
            y1={min($yRange)}
            x2={tickCoords.x}
            y2={max($yRange)}
            class="gridline stroke-gray-200"
            {...gridlines}
          />
        {:else if orientation === 'vertical'}
          <line
            x1={0}
            y1={tickCoords.y}
            x2={$width}
            y2={tickCoords.y}
            class="gridline stroke-gray-200"
            {...gridlines}
          />
        {/if}
      {/if}

      {#if orientation === 'horizontal'}
        <line
          x1={tickCoords.x}
          y1={tickCoords.y}
          x2={tickCoords.x}
          y2={tickCoords.y + (placement === 'top' ? -tickSize : tickSize)}
          class="tick stroke-gray-400"
        />
      {:else if orientation === 'vertical'}
        <line
          x1={tickCoords.x}
          y1={tickCoords.y}
          x2={tickCoords.x + (placement === 'left' ? -tickSize : tickSize)}
          y2={tickCoords.y}
          class="tick stroke-gray-400"
        />
      {/if}

      <Text
        x={tickCoords.x}
        y={tickCoords.y}
        class="label text-[10px] stroke-white [stroke-width:2px] font-light"
        value={formatValue(tick, format ?? scale.tickFormat?.())}
        {...getDefaultLabelProps()}
        {...labelProps}
      />
    </g>
  {/each}
</g>
