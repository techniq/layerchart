<script module lang="ts">
	import { getOlympians } from '$lib/data.remote.js';
	const olympians = await getOlympians();
</script>

<script lang="ts">
	import { extent, mode } from 'd3-array';
	import { Axis, Bin, Chart, Layer, Legend } from 'layerchart';

	const data = olympians.filter((d) => d.weight != null && d.height != null);
	export { data };
</script>

<!-- Each cell sized by its count, and colored by the sex most of it is.  The domains span every
     athlete, so hiding a sex from the legend leaves the axes where they were -->
<Chart
	{data}
	x="weight"
	y="height"
	c="sex"
	cDomain={['female', 'male']}
	cRange={['var(--color-danger)', 'var(--color-primary)']}
	xDomain={extent(data, (d) => d.weight)}
	yDomain={extent(data, (d) => d.height)}
	xNice
	yNice
	xPadding={[20, 20]}
	yPadding={[20, 20]}
	padding={{ left: 30, bottom: 24, top: 32, right: 8 }}
	height={400}
>
	<Legend placement="top" />
	<Layer>
		<Bin r="count" fill={(cell) => mode(cell.data, (d) => d.sex)} />
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
	</Layer>
</Chart>
