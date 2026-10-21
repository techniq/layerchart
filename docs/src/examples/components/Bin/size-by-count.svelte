<script module lang="ts">
	import { getPenguins } from '$lib/data.remote.js';
	const penguins = await getPenguins();
</script>

<script lang="ts">
	import { Axis, Bin, Chart, ChartClipPath, Layer } from 'layerchart';

	const data = penguins.filter((d) => d.bill_length_mm != null && d.bill_depth_mm != null);
	export { data };
</script>

<Chart
	{data}
	x="bill_length_mm"
	y="bill_depth_mm"
	xNice
	yNice
	xPadding={[20, 20]}
	yPadding={[20, 20]}
	padding={{ left: 30, bottom: 24, top: 8, right: 8 }}
	height={400}
>
	<Layer>
		<!-- Clipped, as the grid's edge cells cross the axes -->
		<ChartClipPath>
			<Bin data={[]} empty fill="none" class="stroke-surface-content/10" />
		</ChartClipPath>
		<Bin r="count" fill="currentColor" />
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
	</Layer>
</Chart>
