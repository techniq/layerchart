<script>
	import { Legend } from 'layerchart';
	import { scaleDivergingSqrt } from 'd3-scale';
	import { interpolateRdBu } from 'd3-scale-chromatic';
</script>

<div class="grid gap-6 p-2">
	<Legend
		scale={scaleDivergingSqrt([-0.1, 0, 0.1], interpolateRdBu)}
		title="Daily change"
		tickFormat="percentRound"
	/>
	<Legend
		scale={scaleDivergingSqrt([-0.1, 0, 0.1], interpolateRdBu)}
		title="Daily change"
		tickFormat="percentRound"
		variant="swatches"
	/>
</div>
