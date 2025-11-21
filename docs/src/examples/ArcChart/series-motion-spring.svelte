<script lang="ts">
	import { ArcChart } from 'layerchart';
	import ShowField from '$lib/components/controls/fields/ShowField.svelte';

	const data = [
		{ key: 'move', value: 400, maxValue: 1000, color: '#ef4444' },
		{ key: 'exercise', value: 20, maxValue: 30, color: '#a3e635' },
		{ key: 'stand', value: 10, maxValue: 12, color: '#22d3ee' }
	];
	export { data };

	let show = $state(true);
</script>

<ShowField bind:show label="Show Arcs" />

<div style:height="180px">
	{#if show}
		<ArcChart
			key="key"
			value="value"
			series={data.map((d) => {
				return {
					key: d.key,
					data: [d],
					maxValue: d.maxValue,
					color: d.color
				};
			})}
			props={{ arc: { motion: 'spring' } }}
			outerRadius={-25}
			innerRadius={-20}
			cornerRadius={10}
		/>
	{/if}
</div>
