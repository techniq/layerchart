<script>
	import { Legend } from 'layerchart';
	import { range } from 'd3-array';
	import { scaleSequentialQuantile } from 'd3-scale';
	import { interpolateBlues } from 'd3-scale-chromatic';

	const randomExponentialData = range(100).map(() => Math.random() ** 2);
</script>

<div class="grid gap-6">
	<Legend
		scale={scaleSequentialQuantile(randomExponentialData, interpolateBlues)}
		title="Quantile"
		tickFormat="decimal"
	/>
	<Legend
		scale={scaleSequentialQuantile(randomExponentialData, interpolateBlues)}
		title="Quantile"
		tickFormat="decimal"
		variant="swatches"
	/>
</div>
