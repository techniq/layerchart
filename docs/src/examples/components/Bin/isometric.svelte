<script module lang="ts">
	import { getOlympians } from '$lib/data.remote.js';
	const olympians = await getOlympians();
</script>

<script lang="ts">
	import { Axis, Bin, Chart, isometric, Layer } from 'layerchart';

	const data = olympians.filter((d) => d.weight != null && d.height != null);
	export { data };
</script>

<!-- Each hexagon raised by its count, measured by `zScale`, and padded by a cell so none reaches
     the axes.  Drag to rotate, and hold shift to zoom, so scrolling the page passes over it. -->
<Chart
	{data}
	x="weight"
	y="height"
	xNice
	yNice
	xPadding={[24, 24]}
	yPadding={[24, 24]}
	zRange={({ height }) => [0, height * 0.4]}
	view={isometric({ rotate: 25, tilt: 60 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	padding={{ left: 30, bottom: 24, top: 8, right: 8 }}
	height={500}
>
	<Layer>
		<Axis placement="left" grid rule tickLabelProps={{ viewport: true }} />
		<Axis placement="bottom" rule tickLabelProps={{ viewport: true }} />
		<Axis placement="top" rule tickLabelProps={{ viewport: true }} />
		<Axis placement="right" rule tickLabelProps={{ viewport: true }} />
		<Bin size={24} z="count" />
	</Layer>
</Chart>
