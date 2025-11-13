<script lang="ts">
	import { ArcChart } from 'layerchart';
	import { Field, Switch } from 'svelte-ux';

	const data = [
		{ key: 'move', value: 400, maxValue: 1000, color: '#ef4444' },
		{ key: 'exercise', value: 20, maxValue: 30, color: '#a3e635' },
		{ key: 'stand', value: 10, maxValue: 12, color: '#22d3ee' }
	];
	export { data };

	let show = $state(true);
</script>

<Field label="Show" labelPlacement="left" let:id class="absolute top-2 right-2 z-1">
	<Switch {id} bind:checked={show} size="md" />
</Field>

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
			props={{ arc: { motion: 'tween' } }}
			outerRadius={-25}
			innerRadius={-20}
			cornerRadius={10}
		/>
	{/if}
</div>
