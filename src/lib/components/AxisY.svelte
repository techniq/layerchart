<script lang="ts">
  import { getContext, type ComponentProps } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import { format, type FormatType } from 'svelte-ux';
  import { min, max } from 'd3-array';

  import Text from './Text.svelte';
  import { isScaleBand } from '$lib/utils/scales';

  const { padding, xRange, yScale, width } = getContext('LayerCake');

  export let gridlines: boolean | SVGAttributes<SVGLineElement> = false;
  export let formatTick: FormatType = undefined;
  export let ticks: number | Function = 4;
  export let xTick = 0;
  export let yTick = 0;
  export let dxTick = 0;
  export let dyTick = -3; // TODO: Maualliy tweak based on font-size until <Text /> handles custom styles
  export let labelProps: ComponentProps<Text> | undefined = undefined;

  $: isBand = isScaleBand($yScale);

  $: tickVals = Array.isArray(ticks)
    ? ticks
    : isBand
    ? $yScale.domain()
    : $yScale.ticks(typeof ticks === 'function' ? ticks($yScale) : ticks);
</script>

<g class="axis y-axis" transform="translate({-$padding.left}, 0)">
  {#each tickVals as tick, i}
    <g class="tick tick-{tick}" transform="translate({min($xRange)}, {$yScale(tick)})">
      {#if gridlines !== false}
        <line
          x1={$padding.left}
          x2={$width + $padding.left}
          y1={yTick + (isBand ? $yScale.bandwidth() / 2 : 0)}
          y2={yTick + (isBand ? $yScale.bandwidth() / 2 : 0)}
          class="stroke-gray-200"
          {...gridlines}
        />
      {/if}
      <!-- <circle
        cx={$padding.left - 4}
        cy={yTick + (isBand ? $yScale.bandwidth() / 2 : 0)}
        r="2"
        fill="red"
      /> -->
      <Text
        x={$padding.left - 4}
        y={yTick + (isBand ? $yScale.bandwidth() / 2 : 0)}
        dx={dxTick}
        dy={dyTick}
        textAnchor="end"
        verticalAnchor="middle"
        value={format(tick, formatTick ?? $yScale.tickFormat?.())}
        class="text-[10px] stroke-white [stroke-width:2px] font-light"
        {...labelProps}
      />
    </g>
  {/each}
</g>
