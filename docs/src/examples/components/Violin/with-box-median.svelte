<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Axis, Chart, Layer, Violin } from 'layerchart';

	const data = [
		{
			group: 'A',
			values: [
				2, 5, 7, 8, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 28, 30, 30, 32, 33, 35, 36,
				38, 40, 40, 42, 44, 45, 48, 50, 52, 55, 58, 60, 65, 70, 80
			]
		},
		{
			group: 'B',
			values: [
				15, 18, 20, 22, 24, 25, 26, 28, 28, 30, 30, 32, 32, 34, 35, 35, 36, 38, 38, 40, 40, 42,
				42, 44, 45, 45, 46, 48, 50, 52, 54, 55, 58, 60, 62, 65
			]
		},
		{
			group: 'C',
			values: [
				5, 10, 12, 15, 18, 20, 20, 22, 22, 24, 25, 25, 26, 28, 28, 30, 30, 30, 32, 32, 34, 35,
				35, 38, 40, 42, 45, 48, 50, 55, 60, 65, 70, 72, 75, 78
			]
		},
		{
			group: 'D',
			values: [
				20, 25, 28, 30, 32, 34, 35, 36, 38, 38, 40, 40, 42, 42, 44, 44, 45, 45, 46, 48, 48, 50,
				50, 52, 52, 54, 55, 56, 58, 60, 62, 64, 65, 68, 70, 75
			]
		}
	];

	export { data };
</script>

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
				box
				median
				fill="oklch(0.7 0.15 260)"
				fillOpacity={0.2}
				stroke="oklch(0.7 0.15 260)"
			/>
		{/each}
	</Layer>
</Chart>
