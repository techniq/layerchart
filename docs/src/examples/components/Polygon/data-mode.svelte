<script lang="ts">
	import { Chart, Polygon, Axis, Layer } from 'layerchart';

	const data = [
		{ date: new Date('2024-01-01'), value: 10 },
		{ date: new Date('2024-03-01'), value: 35 },
		{ date: new Date('2024-05-01'), value: 22 },
		{ date: new Date('2024-07-01'), value: 48 },
		{ date: new Date('2024-09-01'), value: 30 },
		{ date: new Date('2024-11-01'), value: 55 }
	];
</script>

<Chart
	{data}
	x="date"
	y="value"
	yNice
	padding={{ top: 20, bottom: 20, left: 24, right: 10 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" rule />
		<Axis placement="left" rule />
		<Polygon cx="date" cy="value" r={8} points={6} class="fill-primary" />
	</Layer>
</Chart>
