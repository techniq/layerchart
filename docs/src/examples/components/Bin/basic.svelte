<script module lang="ts">
	import { getOlympians } from '$lib/data.remote.js';
	const olympians = await getOlympians();
</script>

<script lang="ts">
	import { Axis, Bin, Chart, Layer } from 'layerchart';

	const data = olympians.filter((d) => d.weight != null && d.height != null);
	export { data };
</script>

<!-- Padded by a cell's width, so no cell reaches the axes -->
<Chart
	{data}
	x="weight"
	y="height"
	xNice
	yNice
	xPadding={[20, 20]}
	yPadding={[20, 20]}
	padding={{ left: 30, bottom: 24, top: 8, right: 8 }}
	height={400}
>
	<Layer>
		<Bin />
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
	</Layer>
</Chart>
