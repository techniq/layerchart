<script>
	import { Legend } from 'layerchart';
	import { scaleQuantile } from 'd3-scale';
	import { schemeSpectral } from 'd3-scale-chromatic';
	import { range } from 'd3-array';
	import { randomNormal } from 'd3-random';

	const randomNormalData = range(1000).map(randomNormal(100, 20));
</script>

<div class="grid gap-6">
	<Legend
		scale={scaleQuantile(randomNormalData, schemeSpectral[9])}
		title="Height (cm)"
		tickFormat="integer"
	/>
	<!-- TODO: Fix Legend swatches for scaleQuantile -->
	<!-- <Legend
      scale={scaleQuantile(randomNormalData, schemeSpectral[9])}
      title="Height (cm)"
      tickFormat="integer"
      variant="swatches"
    /> -->
</div>
