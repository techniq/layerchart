<script module lang="ts">
	import { getOlympians } from '$lib/data.remote.js';
	const olympians = await getOlympians();
</script>

<script lang="ts">
	import { Axis, Bin, Chart, Grid, WebGL, Tooltip, perspective } from '@layerchart/webgl';

	const data = olympians.filter((d) => d.weight != null && d.height != null);
	export { data };
</script>

<!-- Athletes binned into hexagons, each raised by (and colored by) its count -->
<Chart
	view={perspective({ rotate: 25, tilt: 60 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	{data}
	x="weight"
	y="height"
	xNice
	yNice
	xPadding={[24, 24]}
	yPadding={[24, 24]}
	zRange={({ height }) => [0, height * 0.4]}
	tooltipContext
	height={500}
	class="cursor-grab active:cursor-grabbing"
>
	<WebGL>
		<Grid z={false} />
		<Axis placement="bottom" label="weight (kg)" />
		<Axis placement="left" label="height (m)" />
		<Bin size={21} z="count" tooltip />
	</WebGL>

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.List>
				<Tooltip.Item label="athletes" value={data.count} format="integer" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
