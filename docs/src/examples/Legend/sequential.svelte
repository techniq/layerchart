<script>
	import { Legend } from 'layerchart';
	import { scaleSequential } from 'd3-scale';
	import { interpolateViridis } from 'd3-scale-chromatic';
</script>

<div class="grid gap-6">
	<Legend scale={scaleSequential([0, 100], interpolateViridis)} title="Temperature (°F)" />

	<Legend
		scale={scaleSequential([0, 100], interpolateViridis)}
		title="Temperature (°F)"
		variant="swatches"
	/>
</div>
