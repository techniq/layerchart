<script lang="ts">
	import { scaleSequential } from 'd3-scale';
	import { interpolateRainbow } from 'd3-scale-chromatic';
	import { Axis, Chart, Layer, Raster } from 'layerchart';
</script>

<Chart
	cScale={scaleSequential(interpolateRainbow)}
	xDomain={[-1, 1]}
	yDomain={[-1, 1]}
	padding={{ left: 30, bottom: 24, top: 8, right: 8 }}
	height={400}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Raster value={(x, y) => Math.atan2(y, x)} />
	</Layer>
</Chart>
