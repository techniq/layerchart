<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { extent } from 'd3-array';
	import {
		Axis,
		BoxPlot,
		Chart,
		Highlight,
		Layer,
		Tooltip,
		Violin,
		computeBoxStats
	} from 'layerchart';

	// Generate 5 distributions with different characteristics
	function generateSamples(count: number, mean: number, stddev: number): number[] {
		const values: number[] = [];
		for (let i = 0; i < count; i++) {
			// Box-Muller transform for normal distribution
			const u1 = Math.random();
			const u2 = Math.random();
			const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
			values.push(mean + z * stddev);
		}
		return values;
	}

	const distributions = [
		{ group: 'A', mean: 50, stddev: 12 },
		{ group: 'B', mean: 40, stddev: 8 },
		{ group: 'C', mean: 60, stddev: 15 },
		{ group: 'D', mean: 45, stddev: 10 },
		{ group: 'E', mean: 55, stddev: 18 }
	];

	const data = distributions.map((d) => {
		const values = generateSamples(200, d.mean, d.stddev);
		return {
			group: d.group,
			values,
			...computeBoxStats(values)
		};
	});

	const yDomain = extent(data.flatMap((d) => d.values)) as [number, number];

	export { data };
</script>

<Chart
	{data}
	x="group"
	xScale={scaleBand().padding(0.2)}
	y="median"
	{yDomain}
	yNice
	tooltipContext={{ mode: 'band' }}
	padding={{ left: 30, bottom: 24, top: 8, right: 8 }}
	height={350}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />

		{#each data as item}
			<Violin
				data={item}
				values="values"
				fill="oklch(0.8 0.05 260)"
				fillOpacity={0.25}
				stroke="oklch(0.7 0.08 260)"
				strokeWidth={1}
			/>
			<BoxPlot
				data={item}
				min="min"
				q1="q1"
				median="median"
				q3="q3"
				max="max"
				outliers="outliers"
				width={16}
				fill="white"
				fillOpacity={0.4}
				stroke="oklch(0.4 0.1 260)"
				strokeWidth={1.5}
				radius={2}
				outlierRadius={3}
			/>
		{/each}

		<Highlight area />
	</Layer>

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header value={`Group ${data.group}`} />
			<Tooltip.List>
				<Tooltip.Item label="Max" value={data.max} format="decimal" />
				<Tooltip.Item label="Q3" value={data.q3} format="decimal" />
				<Tooltip.Item label="Median" value={data.median} format="decimal" />
				<Tooltip.Item label="Q1" value={data.q1} format="decimal" />
				<Tooltip.Item label="Min" value={data.min} format="decimal" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
