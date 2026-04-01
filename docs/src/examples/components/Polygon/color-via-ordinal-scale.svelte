<script lang="ts">
	import { Chart, Polygon, Axis, Layer } from 'layerchart';

	const data = [
		{ date: new Date('2024-01-01'), value: 10, category: 'A' },
		{ date: new Date('2024-03-01'), value: 35, category: 'B' },
		{ date: new Date('2024-05-01'), value: 22, category: 'A' },
		{ date: new Date('2024-07-01'), value: 48, category: 'B' },
		{ date: new Date('2024-09-01'), value: 30, category: 'A' },
		{ date: new Date('2024-11-01'), value: 55, category: 'B' },
	];
</script>

<Chart
	{data}
	x="date"
	y="value"
	yNice
	c="category"
	cRange={['var(--color-primary)', 'var(--color-secondary)']}
	padding={{ top: 20, bottom: 20, left: 24, right: 10 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" rule />
		<Axis placement="left" rule />
		<Polygon cx="date" cy="value" r={8} points={6} fill="category" />
	</Layer>
</Chart>
