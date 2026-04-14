<script lang="ts">
	import { scaleThreshold } from 'd3-scale';
	import { AnnotationLine, Chart, Rect, Axis, Layer } from 'layerchart';
	import { bin } from 'd3-array';

	const raw = [12, 15, 18, 21, 23, 25, 27, 28, 30, 32, 34, 35, 37, 38, 40, 42, 44, 45, 48, 50, 52, 55, 58, 60, 62, 65, 68, 70, 72, 75];

	const histogram = bin().thresholds(8)(raw);
	const data = histogram.map((b) => ({
		x0: b.x0!,
		x1: b.x1!,
		count: b.length,
	}));
</script>

<Chart
	{data}
	x={['x0', 'x1']}
	y="count"
	yDomain={[0, null]}
	yNice
	c="count"
	cScale={scaleThreshold()}
	cDomain={[3, 5]}
	cRange={['var(--color-danger)', 'var(--color-warning)', 'var(--color-success)']}
	padding={{ top: 20, bottom: 20, left: 24, right: 10 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" rule />
		<Axis placement="left" rule />
		<AnnotationLine
			y={3}
			props={{
				line: { dashArray: [4], stroke: 'var(--color-danger)', strokeOpacity: 0.5 },
			}}
		/>
		<AnnotationLine
			y={5}
			props={{
				line: { dashArray: [4], stroke: 'var(--color-success)', strokeOpacity: 0.5 },
			}}
		/>
		<Rect
			x0="x0"
			y0={(d: any) => 0}
			x1="x1"
			y1="count"
			insets={{ x: 1 }}
			fill="count"
		/>
	</Layer>
</Chart>
