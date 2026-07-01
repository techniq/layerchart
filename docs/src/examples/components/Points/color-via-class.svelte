<script lang="ts">
	import { scaleThreshold } from 'd3-scale';
	import { Axis, Chart, Layer, Points } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ min: 10, max: 100, value: 'integer' });

	export { data };
</script>

<Chart {data} x="date" y="value" yDomain={[0, null]} yNice padding={20} height={300}>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Points class="fill-red-500" />
	</Layer>
</Chart>
