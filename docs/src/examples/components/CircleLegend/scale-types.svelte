<script lang="ts">
	import { CircleLegend } from 'layerchart';
	import { scaleLinear, scaleSqrt, scaleLog, scalePow } from 'd3-scale';

	const linear = scaleLinear([0, 1_000_000], [0, 50]);
	const sqrt = scaleSqrt([0, 1_000_000], [0, 50]);
	const log = scaleLog([1, 1_000_000], [4, 50]);
	const pow = scalePow().exponent(0.3).domain([0, 1_000_000]).range([0, 50]);
</script>

<div class="flex flex-wrap gap-4">
	<CircleLegend scale={sqrt} title="Sqrt" tickFormat="metric" />
	<CircleLegend scale={linear} title="Linear" tickFormat="metric" />
	<CircleLegend scale={log} title="Log" tickFormat="metric" />
	<CircleLegend scale={pow} title="Pow (0.3)" tickFormat="metric" />
</div>
