<script>
	import { Legend } from 'layerchart';
	import { scaleOrdinal } from 'd3-scale';
	import { schemeSpectral } from 'd3-scale-chromatic';
</script>

<Legend
	scale={scaleOrdinal(
		['<10', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '≥80'],
		schemeSpectral[10]
	)}
	title="Age (years)"
	variant="swatches"
	classes={{
		root: 'w-full',
		swatch: 'size-2',
		item: 'text-xs'
	}}
/>
