<script module>
	export const title = 'Tour de France Stage Profile';
	export const description = 'Elevation profile of a Tour de France stage using trail width to encode elevation.';
</script>

<script module lang="ts">
	import { getTdfStage } from '$lib/data.remote';
	const data = await getTdfStage();
</script>

<script lang="ts">
	import { Axis, Chart, Layer, Spline, Trail } from 'layerchart';


	export { data };
</script>

<Chart
	{data}
	x="long"
	y="lat"
	r="elev"
	rRange={[1, 20]}
	padding={{ left: 50, bottom: 30 }}
	height={500}
>
	<Layer>
		<Axis placement="left" grid label="Latitude" />
		<Axis placement="bottom" label="Longitude" />
		<Trail class="fill-danger/40" />
		<Spline class="stroke-1 stroke-surface-content" />
	</Layer>
</Chart>
