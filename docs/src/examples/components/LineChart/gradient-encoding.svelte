<script lang="ts">
	import { LinearGradient, LineChart, Spline } from 'layerchart';
	import { getDailyTemperature } from '$lib/data.remote';
	import { ticks } from 'd3-array';
	import { scaleSequential } from 'd3-scale';
	import { interpolateTurbo } from 'd3-scale-chromatic';

	const data = $derived(await getDailyTemperature());
	export { data };
</script>

<LineChart
	{data}
	x="date"
	y="value"
	c="value"
	cScale={scaleSequential(interpolateTurbo)}
	yDomain={null}
	height={300}
>
	{#snippet marks()}
		<LinearGradient stops={ticks(1, 0, 10).map(interpolateTurbo)} vertical>
			{#snippet children({ gradient })}
				<Spline stroke={gradient} />
			{/snippet}
		</LinearGradient>
	{/snippet}
</LineChart>
