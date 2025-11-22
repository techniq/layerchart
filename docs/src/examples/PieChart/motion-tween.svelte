<script lang="ts">
	import { PieChart } from 'layerchart';
	import ShowControl from '$lib/components/controls/fields/ShowField.svelte';
	import { longData } from '$lib/utils/data';

	const data = longData.filter((d) => d.year === 2019);
	export { data };

	let show = $state(true);
</script>

<ShowControl bind:show label="Show Pie" />

<div style:height="300px">
	{#if show}
		<PieChart {data} key="fruit" value="value" props={{ pie: { motion: 'tween' } }} />
	{/if}
</div>
