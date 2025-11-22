<script lang="ts">
	import { LineChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { slide } from 'svelte/transition';
	import ShowControls from '$lib/components/controls/fields/ShowField.svelte';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	export { data };

	let show = $state(true);
</script>

<ShowControls bind:show label="Show Line" />

<div class="h-[300px]">
	{#if show}
		<LineChart {data} x="date" y="value" props={{ spline: { draw: true } }} />
	{/if}
</div>
