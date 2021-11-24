<script lang="ts">
	import { getContext } from 'svelte';

	const { data, xGet, yGet, y, yScale, rGet, config } = getContext('LayerCake');

	export let color: string | ((obj: { value: any; item: any; index: number }) => string) =
		'var(--color-blue-500)';
	export let radius = 5;

	$: midHeight = $yScale.bandwidth() / 2;

	function getColor(item: any, index: number) {
		if (typeof color == 'function') {
			return color({ value: $y(item), item, index });
		} else if ($config.r) {
			return $rGet(item);
		} else {
			return color;
		}
	}
</script>

<g class="dot-plot">
	{#each $data as row}
		<g class="dot-row">
			<line
				x1={Math.min(...$xGet(row))}
				y1={$yGet(row) + midHeight}
				x2={Math.max(...$xGet(row))}
				y2={$yGet(row) + midHeight}
			/>
			{#each $xGet(row) as circleX, i}
				<circle cx={circleX} cy={$yGet(row) + midHeight} r={radius} fill={getColor(row, i)} />
			{/each}
		</g>
	{/each}
</g>

<style lang="postcss">
	line {
		stroke-width: 1px;
		stroke: #000;
	}
	circle {
		stroke: #000;
		stroke-width: 1px;
	}
</style>
