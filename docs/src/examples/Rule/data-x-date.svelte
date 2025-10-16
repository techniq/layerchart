<script>
	import { createDateSeries } from '$lib/utils/data';
	import { Axis, Chart, Layer, Rule } from 'layerchart';

	const data = createDateSeries({ count: 20, keys: ['value', 'low', 'high'] });
	export { data };
</script>

<Chart
	{data}
	x="date"
	y="value"
	yNice
	padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" rule />
		<Axis placement="left" />
		<Rule class="stroke-2 stroke-primary" />
	</Layer>
</Chart>
