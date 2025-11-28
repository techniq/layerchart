<script>
	import { createDateSeries } from '$lib/utils/data';
	import { Axis, Chart, Layer, Rule } from 'layerchart';

	const data = createDateSeries({ count: 20, keys: ['value', 'low', 'high'] });

	export { data };
</script>

<Chart {data} x="date" y="value" yNice padding={20} height={300}>
	<Layer>
		<Axis placement="bottom" rule />
		<Axis placement="left" />
		<Rule class="stroke-4 stroke-primary" />
	</Layer>
</Chart>
