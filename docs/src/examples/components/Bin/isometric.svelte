<script module lang="ts">
	import { getOlympians } from '$lib/data.remote.js';
	const olympians = await getOlympians();
</script>

<script lang="ts">
	import { extent } from 'd3-array';
	import { Axis, Bin, Chart, isometric, Layer } from 'layerchart';

	const data = olympians.filter((d) => d.weight != null && d.height != null);
	export { data };

	/** `[min, max]` widened by a tenth either side, so no cell reaches the axes */
	function padded(values: number[]) {
		const [min, max] = extent(values) as [number, number];
		const margin = (max - min) * 0.1;
		return [min - margin, max + margin];
	}
</script>

<!-- Each hexagon raised by its count, measured by `zScale`.  Padded in data units rather than
     pixels (`xPadding`), as the floor is refitted to the view as it turns.  Drag to rotate, and
     hold shift to zoom, so scrolling the page passes over it. -->
<Chart
	{data}
	x="weight"
	y="height"
	xNice
	yNice
	xDomain={padded(data.map((d) => d.weight))}
	yDomain={padded(data.map((d) => d.height))}
	zRange={({ height }) => [0, height * 0.4]}
	view={isometric}
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
