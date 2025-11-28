<script lang="ts">
	import { AreaChart, type ChartContextValue } from 'layerchart';
	import { timeDay } from 'd3-time';
	import { randomWalk } from '$lib/utils/data.js';
	import { format } from '@layerstack/utils';

	const now = new Date();
	const data = randomWalk({ count: 1000 }).map((value, i) => ({
		date: timeDay.offset(now, i),
		value: 10 + value
	}));

	export { data };

	let context = $state<ChartContextValue<(typeof data)[number]>>(null!);
</script>

<div class="text-sm">
	{#if context && context.tooltip.data}
		date: {format(context.tooltip.data.date, 'day', { variant: 'short' })}
		value: {context.tooltip.data.value}
	{:else}
		[hover chart]
	{/if}
</div>

<AreaChart bind:context {data} x="date" y="value" height={300} />
