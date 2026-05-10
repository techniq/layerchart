<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import { scaleOrdinal } from 'd3-scale';
	import { quantize } from 'd3-interpolate';
	import { interpolateSpectral } from 'd3-scale-chromatic';
	import { Axis, Chart, Layer, Spline } from 'layerchart';

	const yearColor = scaleOrdinal<number, string>(quantize(interpolateSpectral, 6));

	export { data };
</script>

<Chart {data} x="date" y="value" yNice padding={25} height={300}>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Spline stroke={(d) => yearColor(d.date.getFullYear())} class="stroke-2" />
	</Layer>
</Chart>
