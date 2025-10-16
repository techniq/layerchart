<script>
	import { Legend } from 'layerchart';
	import { scaleDiverging } from 'd3-scale';
	import { interpolatePiYG } from 'd3-scale-chromatic';
</script>

<div class="grid gap-6">
	<Legend
		scale={scaleDiverging([-0.1, 0, 0.1], interpolatePiYG)}
		title="Daily change"
		tickFormat="percentRound"
	/>
	<Legend
		scale={scaleDiverging([-0.1, 0, 0.1], interpolatePiYG)}
		title="Daily change"
		tickFormat="percentRound"
		variant="swatches"
	/>
</div>
