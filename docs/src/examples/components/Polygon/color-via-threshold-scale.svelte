<script lang="ts">
	import { scaleThreshold } from 'd3-scale';
	import { AnnotationLine, Chart, Polygon, Axis, Layer } from 'layerchart';

	const data = [
		{ date: new Date('2024-01-01'), value: 10 },
		{ date: new Date('2024-03-01'), value: 35 },
		{ date: new Date('2024-05-01'), value: 22 },
		{ date: new Date('2024-07-01'), value: 48 },
		{ date: new Date('2024-09-01'), value: 80 },
		{ date: new Date('2024-11-01'), value: 92 },
	];
</script>

<Chart
	{data}
	x="date"
	y="value"
	yDomain={[0, 100]}
	c="value"
	cScale={scaleThreshold()}
	cDomain={[50, 90]}
	cRange={['var(--color-danger)', 'var(--color-warning)', 'var(--color-success)']}
	padding={{ top: 20, bottom: 20, left: 24, right: 10 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" rule />
		<Axis placement="left" rule />
		<AnnotationLine
			y={50}
			props={{
				line: { dashArray: [4], stroke: 'var(--color-danger)', strokeOpacity: 0.5 },
			}}
		/>
		<AnnotationLine
			y={90}
			props={{
				line: { dashArray: [4], stroke: 'var(--color-success)', strokeOpacity: 0.5 },
			}}
		/>
		<Polygon cx="date" cy="value" r={8} points={6} fill="value" />
	</Layer>
</Chart>
