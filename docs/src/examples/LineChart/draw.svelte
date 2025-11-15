<script lang="ts">
	import { LineChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { slide } from 'svelte/transition';
	import ShowControl from '$lib/components/ShowControl.svelte';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	let show = $state(true);

	export { data };
</script>

<ShowControl bind:show label="Show Line" />
<div class="h-[300px]">
	{#if show}
		<LineChart
			{data}
			x="date"
			y="value"
			props={{ spline: { draw: true } }}
			padding={20}
			height={300}
		/>
	{/if}
</div>
