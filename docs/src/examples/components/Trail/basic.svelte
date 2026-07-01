<script lang="ts">
	import { Axis, Chart, Layer, Trail } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 30, min: 20, max: 100, value: 'integer' });

	export { data };
</script>

<Chart
	{data}
	x="date"
	y="value"
	yBaseline={0}
	yNice
	r="value"
	rRange={[0, 15]}
	padding={20}
	xPadding={[20, 20]}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Trail r="value" class="fill-primary" />
	</Layer>
</Chart>
