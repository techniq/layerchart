<script lang="ts">
	import { getContext } from 'svelte';
	import { format } from 'svelte-ux/utils/format';
	import type { FormatType } from 'svelte-ux/utils/format';

	import Text from './Text.svelte';
	import { isScaleBand } from '$lib/utils/scales';

	const { padding, xRange, yScale, width } = getContext('LayerCake');

	export let gridlines = false;
	export let ticks: number | Function = 4;
	export let formatTick: FormatType = undefined;
	export let xTick = 0;
	export let yTick = 0;
	export let dxTick = 0;
	export let dyTick = -3; // TODO: Maualliy tweak based on font-size until <Text /> handles custom styles

	$: isBand = isScaleBand($yScale);

	$: tickVals = Array.isArray(ticks)
		? ticks
		: isBand
		? $yScale.domain()
		: $yScale.ticks(typeof ticks === 'function' ? ticks($yScale) : ticks);
</script>

<g class="axis y-axis" transform="translate({-$padding.left}, 0)">
	{#each tickVals as tick, i}
		<g
			class="tick tick-{tick}"
			transform="translate({$xRange[0] + (isBand ? $padding.left : 0)}, {$yScale(tick)})"
		>
			{#if gridlines !== false}
				<line
					x1={$padding.left}
					x2={$width + $padding.left}
					y1={yTick + (isBand ? $yScale.bandwidth() / 2 : 0)}
					y2={yTick + (isBand ? $yScale.bandwidth() / 2 : 0)}
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
				style="font-size: 10px;"
				value={format(tick, formatTick ?? $yScale.tickFormat?.())}
			/>
		</g>
	{/each}
</g>

<style lang="postcss">
	.tick {
		font-size: 0.725em;
		font-weight: 200;
	}

	.tick line {
		stroke: #e0e0e0;
		/* stroke-dasharray: 2; */
	}

	.tick.tick-0 line {
		stroke-dasharray: 0;
	}
</style>
