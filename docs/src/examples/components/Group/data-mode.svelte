<script lang="ts">
	import { Chart, Circle, Group, Text, Axis, Layer } from 'layerchart';

	const data = [
		{ date: new Date('2024-01-01'), value: 10, label: 'Jan' },
		{ date: new Date('2024-03-01'), value: 35, label: 'Mar' },
		{ date: new Date('2024-05-01'), value: 22, label: 'May' },
		{ date: new Date('2024-07-01'), value: 48, label: 'Jul' },
		{ date: new Date('2024-09-01'), value: 30, label: 'Sep' },
		{ date: new Date('2024-11-01'), value: 55, label: 'Nov' },
	];
</script>

<Chart {data} x="date" y="value" yNice padding={{ top: 30, bottom: 20, left: 24, right: 10 }} height={300}>
	<Layer>
		<Axis placement="bottom" rule />
		<Axis placement="left" rule />
		<Group x="date" y="value">
			<Circle r={4} class="fill-primary" />
			<Text value="label" textAnchor="middle" dy={-2} class="text-xs fill-surface-content" />
		</Group>
	</Layer>
</Chart>
