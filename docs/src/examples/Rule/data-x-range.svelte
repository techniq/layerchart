<script>
	import { createTimeSeries } from '$lib/utils/data';
	import { Axis, Chart, Layer, Rule } from 'layerchart';

	const data = createTimeSeries();
	export { data };
</script>

<Chart
	{data}
	x={['startDate', 'endDate']}
	y="name"
	padding={{ top: 20, bottom: 20, left: 40, right: 20 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" />
		<Axis placement="left" rule />
		<Rule class="stroke-2 stroke-primary" />
	</Layer>
</Chart>
