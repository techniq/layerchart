<script lang="ts">
	import { scaleSequential } from 'd3-scale';
	import { interpolateTurbo } from 'd3-scale-chromatic';
	import { Axis, Chart, Contour, Layer, Raster } from 'layerchart';

	import { getVolcano } from '$lib/data.remote.js';

	const volcano = await getVolcano();
</script>

<Chart
	cScale={scaleSequential(interpolateTurbo)}
	padding={{ left: 30, bottom: 24, top: 8, right: 8 }}
	height={400}
>
	<Layer>
		<Axis placement="left" rule />
		<Axis placement="bottom" rule />
		<Raster data={volcano.values} width={volcano.width} height={volcano.height} />
		<Contour
			data={volcano.values}
			width={volcano.width}
			height={volcano.height}
			fill="none"
			stroke="white"
			strokeWidth={0.5}
			thresholds={20}
		/>
	</Layer>
</Chart>
