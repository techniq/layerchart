<script lang="ts">
	import { Chart, Rect, Axis, Layer } from 'layerchart';
	import { bin } from 'd3-array';

	const raw = [12, 15, 18, 21, 23, 25, 27, 28, 30, 32, 34, 35, 37, 38, 40, 42, 44, 45, 48, 50, 52, 55, 58, 60, 62, 65, 68, 70, 72, 75];

	const histogram = bin().thresholds(8)(raw);
	const data = histogram.map((b, i) => ({
		x0: b.x0!,
		x1: b.x1!,
		count: b.length,
		group: i % 2 === 0 ? 'even' : 'odd',
	}));
</script>

<Chart
	{data}
	x={['x0', 'x1']}
	y="count"
	yDomain={[0, null]}
	yNice
	c="group"
	cRange={['var(--color-primary)', 'var(--color-secondary)']}
	padding={{ top: 20, bottom: 20, left: 24, right: 10 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" rule />
		<Axis placement="left" rule />
		<Rect
			x0="x0"
			y0={(d: any) => 0}
			x1="x1"
			y1="count"
			insets={{ x: 1 }}
			fill="group"
		/>
	</Layer>
</Chart>
