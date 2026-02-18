<script lang="ts">
	import { PieChart } from 'layerchart';
	import { fruitColors } from '$lib/utils/fruits';
	import ShowControl from '$lib/components/controls/fields/ShowField.svelte';
	import { longData } from '$lib/utils/data';

	const data = longData.filter((d) => d.year === 2019);
	let show = $state(true);
	export { data };
</script>

<ShowControl bind:show label="Show Pie" />

<div style:height="300px">
	{#if show}
		<PieChart
			{data}
			key="fruit"
			value="value"
			cRange={fruitColors}
			props={{ pie: { motion: 'spring' } }}
		/>
	{/if}
</div>
