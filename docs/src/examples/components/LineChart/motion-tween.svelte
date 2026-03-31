<script lang="ts">
	import { LineChart, defaultChartPadding } from 'layerchart';
	import ShowControl from '$lib/components/controls/fields/ShowField.svelte';
	import { createDateSeries } from '$lib/utils/data.js';

	let show = $state(true);
	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	export { data };
</script>

<ShowControl bind:show label="Show Chart" />

{#if show}
	<LineChart
		{data}
		x="date"
		y="value"
		props={{ spline: { motion: 'tween' } }}
		padding={defaultChartPadding({ right: 10 })}
		height={300}
	/>
{/if}
