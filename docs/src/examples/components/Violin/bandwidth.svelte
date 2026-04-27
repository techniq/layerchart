<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Axis, Chart, Layer, Violin } from 'layerchart';
	import { RangeField } from 'svelte-ux';

	let bandwidth = $state(5);

	const data = [
		{
			group: 'Tight',
			values: [
				28, 29, 30, 30, 30, 31, 31, 31, 32, 32, 32, 32, 33, 33, 33, 33, 33, 34, 34, 34, 34, 35, 35,
				35, 36, 36, 37, 38
			]
		},
		{
			group: 'Normal',
			values: [
				10, 15, 18, 20, 22, 25, 28, 30, 32, 35, 37, 40, 42, 45, 48, 50, 55, 58, 60, 62, 65, 68, 70,
				75, 78, 80, 85, 90
			]
		},
		{
			group: 'Bimodal',
			values: [
				5, 8, 10, 12, 14, 15, 16, 18, 20, 22, 24, 25, 55, 58, 60, 62, 64, 65, 68, 70, 72, 75, 78,
				80, 82, 85, 88, 90
			]
		},
		{
			group: 'Skewed',
			values: [
				5, 5, 8, 8, 10, 10, 10, 12, 12, 15, 15, 15, 18, 18, 20, 22, 25, 28, 30, 35, 40, 45, 55, 65,
				75, 85, 90, 95
			]
		}
	];

	export { data };
</script>

<div class="mb-4">
	<RangeField label="Bandwidth" bind:value={bandwidth} min={1} max={20} step={0.5} />
</div>

<Chart
	{data}
	x="group"
	xScale={scaleBand().padding(0.1)}
	yDomain={[0, 100]}
	yNice
	padding={{ left: 24, bottom: 20, top: 8 }}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		{#each data as item}
			<Violin
				data={item}
				values="values"
				{bandwidth}
				box
				median
				class="fill-primary/20 stroke-primary"
			/>
		{/each}
	</Layer>
</Chart>
