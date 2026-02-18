<script>
	import { Legend } from 'layerchart';
	import { scaleThreshold } from 'd3-scale';
	import { schemeRdBu } from 'd3-scale-chromatic';
</script>

<div class="grid gap-6">
	<Legend
		scale={scaleThreshold([2.5, 3.1, 3.5, 3.9, 6, 7, 8, 9.5], schemeRdBu[9])}
		title="Unemployment rate (%)"
		tickLength={0}
	/>
	<!-- TODO: Fix Legend swatches for scaleThreshold -->
	<!-- <Legend
      scale={scaleThreshold([2.5, 3.1, 3.5, 3.9, 6, 7, 8, 9.5], schemeRdBu[9])}
      title="Unemployment rate (%)"
      variant="swatches"
    /> -->
</div>
