<script lang="ts">
	import { LineChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 50, min: 50, max: 100 });
	export { data };
</script>

<p class="px-4 py-2">
	Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pretium, ligula ac sollicitudin
	ullamcorper, leo justo pretium tellus, at gravida ex quam et orci.
	<LineChart
		{data}
		x="date"
		y="value"
		yDomain={null}
		axis={false}
		grid={false}
		props={{
			highlight: { points: { r: 3, class: 'stroke-2 stroke-surface-100' } }
		}}
		padding={5}
		height={18}
		width={124}
		class="inline-block"
	/>
	Sed ipsum justo, facilisis id tempor hendrerit, suscipit eu ipsum. Mauris ut sapien quis nibh volutpat
	venenatis. Ut viverra justo varius sapien convallis venenatis vel faucibus urna.
</p>
