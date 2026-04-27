<script module lang="ts">
	import { getVolcano } from '$lib/data.remote.js';
	const volcano = await getVolcano();
</script>

<script lang="ts">
	import { scaleSequential } from 'd3-scale';
	import { interpolateTurbo } from 'd3-scale-chromatic';
	import { Axis, Chart, Layer, Raster } from 'layerchart';
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
	</Layer>
</Chart>
