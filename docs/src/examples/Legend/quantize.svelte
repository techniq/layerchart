<script>
	import { Legend } from 'layerchart';
	import { scaleQuantize } from 'd3-scale';
	import { schemePurples } from 'd3-scale-chromatic';
</script>

<div class="grid gap-6">
	<Legend scale={scaleQuantize([1, 10], schemePurples[9])} title="Unemployment rate (%)" />
	<!-- TODO: Fix Legend swatches for scaleQuantile -->
	<!-- <Legend
      scale={scaleQuantize([1, 10], schemePurples[9])}
      title="Unemployment rate (%)"
      variant="swatches"
    /> -->
</div>
