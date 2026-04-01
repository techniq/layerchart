<script lang="ts">
	import { Chart, Circle, Axis, Layer } from 'layerchart';

	const data = [
		{ date: new Date('2024-01-01'), value: 10 },
		{ date: new Date('2024-02-01'), value: 35 },
		{ date: new Date('2024-03-01'), value: 22 },
		{ date: new Date('2024-04-01'), value: 48 },
		{ date: new Date('2024-05-01'), value: 30 },
		{ date: new Date('2024-06-01'), value: 55 },
		{ date: new Date('2024-07-01'), value: 42 },
		{ date: new Date('2024-08-01'), value: 68 },
	];
</script>

<Chart {data} x="date" y="value" yNice padding={{ top: 20, bottom: 20, left: 24, right: 10 }} height={300}>
	<Layer>
		<Axis placement="bottom" rule />
		<Axis placement="left" rule />
		<Circle cx="date" cy="value" r={5} class="fill-primary" />
	</Layer>
</Chart>
