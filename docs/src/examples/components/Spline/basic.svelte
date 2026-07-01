<script lang="ts">
	import { Axis, Chart, Layer, Spline } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

	export { data };
</script>

<Chart {data} x="date" y="value" yDomain={[0, null]} yNice padding={25} height={300}>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Spline class="stroke-2 stroke-primary" />
	</Layer>
</Chart>
