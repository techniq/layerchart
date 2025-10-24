<script lang="ts">
	import { range, ticks } from 'd3-array';
	import { scaleLinear, scaleSequential } from 'd3-scale';
	import { interpolateTurbo } from 'd3-scale-chromatic';
	import { BarChart, Bars, LinearGradient } from 'layerchart';

	// Simplified frequency example with mock data
	let frequencyData: { key: number; value: number }[] = $state([]);

	const decibels = scaleLinear().domain([0, 255]).range([-100, -30]);
	const colorScale = scaleSequential([0, 256], interpolateTurbo);

	$effect(() => {
		// Generate mock frequency domain data for demonstration
		const mockData = Array.from({ length: 128 }, (_, i) => ({
			key: i,
			value: Math.max(0, 160 - i * 2 + 40 * Math.random())
		}));
		frequencyData = mockData;
	});

	const data = frequencyData;
	export { data };
</script>

<BarChart
	data={frequencyData}
	x="key"
	xDomain={range(0, 128)}
	y="value"
	yDomain={[0, 256]}
	bandPadding={0.2}
	padding={{ left: 24 }}
	axis="y"
	tooltip={{ mode: 'manual' }}
	props={{
		yAxis: { format: (d) => decibels(d)?.toFixed(1) }
	}}
	height={150}
>
	{#snippet marks()}
		<LinearGradient
			stops={ticks(1, 0, 10).map(colorScale.interpolator())}
			vertical
			units="userSpaceOnUse"
		>
			{#snippet children({ gradient })}
				<Bars radius={1} fill={gradient} />
			{/snippet}
		</LinearGradient>
	{/snippet}
</BarChart>
