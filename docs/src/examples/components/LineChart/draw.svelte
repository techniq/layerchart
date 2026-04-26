<script lang="ts">
	import { LineChart, defaultChartPadding } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { slide } from 'svelte/transition';
	import ShowControls from '$lib/components/controls/fields/ShowField.svelte';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	export { data };

	let show = $state();
</script>

<ShowControls bind:show label="Show Line" />

<!-- Note wrapping div is for demo purposes only (Toggling visibility), it is not required in your code. -->
<div class="h-[300px]">
	{#if show}
		<LineChart
			{data}
			x="date"
			y="value"
			padding={defaultChartPadding({ right: 10 })}
			props={{ spline: { draw: true } }}
			height={300}
		/>
	{/if}
</div>
