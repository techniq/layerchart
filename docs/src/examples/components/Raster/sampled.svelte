<script lang="ts">
	import { scaleSequential } from 'd3-scale';
	import { interpolateRdBu } from 'd3-scale-chromatic';
	import { Axis, Chart, Layer, Raster } from 'layerchart';
</script>

<Chart
	cScale={scaleSequential(interpolateRdBu)}
	xDomain={[0, 6 * Math.PI]}
	yDomain={[0, 4 * Math.PI]}
	padding={{ left: 30, bottom: 24, top: 8, right: 8 }}
	height={400}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Raster value={(x, y) => Math.sin(x) * Math.cos(y)} />
	</Layer>
</Chart>
