<script lang="ts">
	import { Chart, Circle, Text, Axis, Layer } from 'layerchart';

	const data = [
		{ date: new Date('2024-01-01'), value: 10, label: 'Jan', category: 'A' },
		{ date: new Date('2024-03-01'), value: 35, label: 'Mar', category: 'B' },
		{ date: new Date('2024-05-01'), value: 22, label: 'May', category: 'A' },
		{ date: new Date('2024-07-01'), value: 48, label: 'Jul', category: 'B' },
		{ date: new Date('2024-09-01'), value: 30, label: 'Sep', category: 'A' },
		{ date: new Date('2024-11-01'), value: 55, label: 'Nov', category: 'B' }
	];
</script>

<Chart
	{data}
	x="date"
	y="value"
	yNice
	c="category"
	cRange={['var(--color-primary)', 'var(--color-secondary)']}
	padding={{ top: 30, bottom: 20, left: 24, right: 10 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" rule />
		<Axis placement="left" rule />
		<Circle cx="date" cy="value" r={4} fill="category" />
		<Text
			x="date"
			y="value"
			value="label"
			textAnchor="middle"
			dy={-2}
			fill="category"
			class="text-xs"
		/>
	</Layer>
</Chart>
