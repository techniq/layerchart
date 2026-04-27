<script module lang="ts">
	import { getFaithful } from '$lib/data.remote.js';
	const data = await getFaithful();
</script>

<script lang="ts">
	import { Axis, Chart, Density, Layer, Points } from 'layerchart';
</script>

<Chart
	{data}
	x="eruptions"
	y="waiting"
	xDomain={[1, 6]}
	yDomain={[40, 100]}
	xNice
	yNice
	padding={{ left: 30, bottom: 24, top: 8, right: 8 }}
	height={400}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Density bandwidth={10} thresholds={20} fillOpacity={0.8} />
		<Points r={1.5} class="fill-surface-content/50" />
	</Layer>
</Chart>
