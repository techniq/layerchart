<script lang="ts">
	import { BarChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 30,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	export { data };
</script>

<p>
	Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pretium, ligula ac sollicitudin
	ullamcorper, leo justo pretium tellus, at gravida ex quam et orci.
	<span class="w-[124px] h-[18px] inline-block">
		<BarChart
			{data}
			x="date"
			y="value"
			axis={false}
			grid={false}
			bandPadding={0.1}
			props={{ bars: { radius: 1, strokeWidth: 0 } }}
		/>
	</span> Sed ipsum justo, facilisis id tempor hendrerit, suscipit eu ipsum. Mauris ut sapien quis nibh
	volutpat venenatis. Ut viverra justo varius sapien convallis venenatis vel faucibus urna.
</p>
