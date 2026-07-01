<script lang="ts">
	import { Chart, CircleLegend } from 'layerchart';
	import { scaleSqrt } from 'd3-scale';
</script>

<Chart data={[{ value: 1 }, { value: 100 }]} r="value" rRange={[2, 40]} height={120}>
	<CircleLegend title="Population" />
</Chart>
