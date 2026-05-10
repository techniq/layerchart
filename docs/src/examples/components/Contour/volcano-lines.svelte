<script module lang="ts">
	import { getVolcano } from '$lib/data.remote.js';
	const volcano = await getVolcano();
</script>

<script lang="ts">
	import { Axis, Chart, Contour, Layer } from 'layerchart';
</script>

<Chart padding={{ left: 30, bottom: 24, top: 8, right: 8 }} height={400}>
	<Layer>
		<Axis placement="left" rule />
		<Axis placement="bottom" rule />
		<Contour
			data={volcano.values}
			width={volcano.width}
			height={volcano.height}
			fill="none"
			stroke="oklch(0.7 0.15 260)"
			strokeWidth={0.5}
			thresholds={20}
		/>
	</Layer>
</Chart>
