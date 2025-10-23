<script lang="ts">
	import { Axis, Chart, Line, Layer } from 'layerchart';
</script>

<Chart
	xDomain={[0, 100]}
	yDomain={[0, 100]}
	padding={{ top: 10, bottom: 20, left: 20, right: 10 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" rule />
		<Axis placement="left" rule />
		<Line x1={100} y1={100} x2={200} y2={200} strokeWidth={10} stroke="var(--color-primary)" />
		<Line x1={50} y1={150} x2={400} y2={150} strokeWidth={2} stroke="var(--color-secondary)" />
		<Line
			x1={50}
			y1={10}
			x2={400}
			y2={50}
			strokeWidth={2}
			stroke="var(--color-accent)"
			markerStart="circle"
			markerEnd="arrow"
		/>
	</Layer>
</Chart>
