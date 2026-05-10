<script lang="ts">
	import { Chart, Circle, Axis, Layer } from 'layerchart';

	const data = [
		{ date: new Date('2024-01-01'), value: 10, category: 'A' },
		{ date: new Date('2024-02-01'), value: 35, category: 'B' },
		{ date: new Date('2024-03-01'), value: 22, category: 'A' },
		{ date: new Date('2024-04-01'), value: 48, category: 'B' },
		{ date: new Date('2024-05-01'), value: 30, category: 'A' },
		{ date: new Date('2024-06-01'), value: 55, category: 'B' },
		{ date: new Date('2024-07-01'), value: 42, category: 'A' },
		{ date: new Date('2024-08-01'), value: 68, category: 'B' }
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
		<Circle cx="date" cy="value" r={5} fill="category" />
	</Layer>
</Chart>
