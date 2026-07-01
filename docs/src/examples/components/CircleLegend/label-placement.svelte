<script lang="ts">
	import { CircleLegend } from 'layerchart';
	import { scaleSqrt } from 'd3-scale';

	const scale = scaleSqrt([0, 1_000_000], [0, 50]);
</script>

<div class="grid gap-6">
	<CircleLegend {scale} title="Population" tickFormat="metric" labelPlacement="right" />
	<CircleLegend {scale} title="Population" tickFormat="metric" labelPlacement="left" />
	<CircleLegend {scale} title="Population" tickFormat="metric" labelPlacement="inline" />
</div>
