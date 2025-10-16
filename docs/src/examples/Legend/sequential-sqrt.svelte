<script>
	import { Legend } from 'layerchart';
	import { scaleSequentialSqrt } from 'd3-scale';
	import { interpolateTurbo } from 'd3-scale-chromatic';
</script>

<div class="grid gap-6">
	<Legend scale={scaleSequentialSqrt([0, 1], interpolateTurbo)} title="Speed (kts)" />
	<Legend
		scale={scaleSequentialSqrt([0, 1], interpolateTurbo)}
		title="Speed (kts)"
		variant="swatches"
	/>
</div>
