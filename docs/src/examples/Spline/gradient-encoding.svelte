<script lang="ts">
	import { scaleSequential } from 'd3-scale';
	import { extent, ticks } from 'd3-array';
	import { interpolateTurbo } from 'd3-scale-chromatic';
	import { Axis, Chart, Layer, Legend, LinearGradient, Spline } from 'layerchart';
	import { getDailyTemperature } from '$lib/data.remote';

	const data = await getDailyTemperature();
	const temperatureColor = scaleSequential(
		extent(data, (d) => d.value) as [number, number],
		interpolateTurbo
	);

	export { data };
</script>

<Chart {data} x="date" y="value" yNice padding={{ left: 16, bottom: 24 }} height={300}>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<LinearGradient stops={ticks(1, 0, 10).map(temperatureColor.interpolator())} vertical>
			{#snippet children({ gradient })}
				<Spline class="stroke-2" stroke={gradient} />
			{/snippet}
		</LinearGradient>
	</Layer>
	<Legend
		scale={temperatureColor}
		title="Temperature (°F)"
		placement="top-right"
		width={240}
		class="-top-[14px]"
	/>
</Chart>
