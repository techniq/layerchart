<script lang="ts">
	import { scaleThreshold } from 'd3-scale';
	import { AnnotationLine, Axis, Chart, Layer, Points } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ min: 10, max: 100, value: 'integer' });

	export { data };
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
	padding={20}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<AnnotationLine
			y={50}
			props={{
				line: { dashArray: [4], stroke: 'var(--color-danger)', strokeOpacity: 0.5 }
			}}
		/>
		<AnnotationLine
			y={90}
			class="[stroke-dasharray:4] opacity-20"
			props={{
				line: { dashArray: [4], stroke: 'var(--color-success)', strokeOpacity: 0.5 }
			}}
		/>
		<Points />
	</Layer>
</Chart>
