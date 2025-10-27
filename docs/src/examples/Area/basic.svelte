<script lang="ts">
	import { Area, Axis, Chart, Layer } from 'layerchart';

	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

	export { data };
</script>

<Chart
	{data}
	x="date"
	y="value"
	yDomain={[0, null]}
	yNice
	padding={{ left: 16, bottom: 24 }}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/30" />
	</Layer>
</Chart>
