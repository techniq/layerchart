<script module lang="ts">
	import { getUsPresidents } from '$lib/data.remote';
	const data = await getUsPresidents();
</script>

<script lang="ts">
	import { Axis, Chart, Image, Layer } from 'layerchart';

	export { data };
</script>

<Chart
	{data}
	x="inaugurationDate"
	y="veryFavorable"
	yNice
	padding={{ top: 20, bottom: 30, left: 36, right: 20 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" label="Inauguration" rule />
		<Axis placement="left" label="Very favorable %" rule />
		<Image
			href="portraitUrl"
			x="inaugurationDate"
			y="veryFavorable"
			r={18}
			preserveAspectRatio="xMidYMid slice"
		/>
	</Layer>
</Chart>
