<script module lang="ts">
	import { getVolcano } from '$lib/data.remote.js';
	const volcano = await getVolcano();
</script>

<script lang="ts">
	import { extent } from 'd3-array';
	import { scaleSequential } from 'd3-scale';
	import { interpolateViridis } from 'd3-scale-chromatic';
	import { Chart, Contour, Raster, WebGL, perspective } from '@layerchart/webgl';
</script>

<!-- Maungawhau's elevation: each contour line raised to its height, over the values on the floor -->
<Chart
	view={perspective({ rotate: -25, tilt: 55, aspect: volcano.width / volcano.height })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	cScale={scaleSequential(interpolateViridis)}
	zDomain={extent(volcano.values) as [number, number]}
	zRange={({ height }) => [0, height * 0.35]}
	height={450}
	class="cursor-grab active:cursor-grabbing"
>
	<WebGL>
		<Raster data={volcano.values} width={volcano.width} height={volcano.height} opacity={0.6} />
		<Contour
			data={volcano.values}
			width={volcano.width}
			height={volcano.height}
			thresholds={14}
			z="value"
			stroke="var(--color-surface-content)"
		/>
	</WebGL>
</Chart>
