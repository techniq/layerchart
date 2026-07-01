<script lang="ts">
	import { BarChart } from 'layerchart';
	import ShowControl from '$lib/components/controls/fields/ShowField.svelte';
	import { createDateSeries } from '$lib/utils/data.js';

	let show = $state();
	const data = createDateSeries({ count: 10, min: 20, max: 100, value: 'integer' });
	export { data };
</script>

<ShowControl bind:show label="Show Chart" />

<!-- Note wrapping div is for demo purposes only (Toggling visibility), it is not required in your code. -->
<div style:height="300px">
	{#if show}
		<BarChart
			{data}
			x="date"
			y="value"
			props={{ bars: { motion: { type: 'tween', duration: 500 } } }}
			height={300}
		/>
	{/if}
</div>
