<script>import { getContext } from 'svelte';
import { format } from 'svelte-ux/utils/format';
import { max } from 'd3-array';
import Text from './Text.svelte';
import { isScaleBand } from '../utils/scales';
const { height, xScale, yRange } = getContext('LayerCake');
export let gridlines = false;
export let formatTick = undefined;
export let ticks = undefined;
export let xTick = undefined;
export let yTick = 8;
export let dxTick = 0;
export let dyTick = 0;
export let labelProps = undefined;
$: isBand = isScaleBand($xScale);
$: tickVals = Array.isArray(ticks)
    ? ticks
    : isBand
        ? $xScale.domain()
        : $xScale.ticks(typeof ticks === 'function' ? ticks($xScale) : ticks);
</script>

<g class="axis x-axis">
	{#each tickVals as tick, i}
		<g class="tick tick-{tick}" transform="translate({$xScale(tick)},{max($yRange)})">
			{#if gridlines !== false}
				<line y1={$height * -1} y2="0" x1="0" x2="0" class="stroke-gray-200" {...gridlines} />
			{/if}
			<Text
				x={xTick || isBand ? $xScale.bandwidth() / 2 : 0}
				y={yTick}
				dx={dxTick}
				dy={dyTick}
				rotate={315}
				textAnchor="end"
				verticalAnchor="middle"
				class="text-[10px] stroke-white [stroke-width:2px] font-light"
				value={format(tick, formatTick ?? $xScale.tickFormat?.())}
				{...labelProps}
			/>
		</g>
	{/each}
</g>
