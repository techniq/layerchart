<script lang="ts">
	import { PieChart, Text } from 'layerchart';
	import { RangeField } from 'svelte-ux';
	import { Spring } from 'svelte/motion';

	let count = $state(60);
	let value = new Spring(75);
	let data = $derived(
		Array.from({ length: count }, (_, i) => {
			return {
				key: i + 1,
				value: 1,
				color:
					(i / count) * 100 < (value.current ?? 0)
						? 'var(--color-success)'
						: 'color-mix(in lch, var(--color-surface-content) 10%, transparent)'
			};
		})
	);
	export { data };
</script>

<PieChart
	{data}
	key="key"
	value="value"
	c="color"
	innerRadius={-20}
	cornerRadius={4}
	padAngle={0.02}
	tooltip={false}
	height={300}
>
	{#snippet aboveMarks()}
		<Text
			value={Math.round(value.current ?? 0)}
			textAnchor="middle"
			verticalAnchor="middle"
			dy={16}
			class="text-6xl tabular-nums"
		/>
	{/snippet}
</PieChart>

<div class="flex justify-self-center gap-2 mt-6">
	<RangeField label="Segments" bind:value={count} min={2} />
	<RangeField label="Value" bind:value={value.target} />
</div>
