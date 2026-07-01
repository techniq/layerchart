<script lang="ts">
	import { scaleThreshold } from 'd3-scale';
	import { AnnotationLine, Chart, Circle, Line, Axis, Layer } from 'layerchart';

	const data = [
		{ date: new Date('2024-01-01'), value: 10 },
		{ date: new Date('2024-02-01'), value: 35 },
		{ date: new Date('2024-03-01'), value: 22 },
		{ date: new Date('2024-04-01'), value: 48 },
		{ date: new Date('2024-05-01'), value: 80 },
		{ date: new Date('2024-06-01'), value: 55 },
		{ date: new Date('2024-07-01'), value: 92 },
		{ date: new Date('2024-08-01'), value: 68 }
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
				line: { dashArray: [4], stroke: 'var(--color-danger)', strokeOpacity: 0.5 }
			}}
		/>
		<AnnotationLine
			y={90}
			props={{
				line: { dashArray: [4], stroke: 'var(--color-success)', strokeOpacity: 0.5 }
			}}
		/>
		<Line x1="date" y1={(d) => 0} x2="date" y2="value" stroke="value" />
		<Circle cx="date" cy="value" r={4} fill="value" />
	</Layer>
</Chart>
