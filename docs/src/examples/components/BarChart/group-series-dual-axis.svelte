<script lang="ts">
	import { Axis, BarChart, Tooltip, defaultChartPadding } from 'layerchart';
	import { scaleLinear } from 'd3-scale';
	import { max } from 'd3-array';

	const data = [
		{ month: 'Jan', energy: 310, peakPower: 210, efficiency: 14.2 },
		{ month: 'Feb', energy: 380, peakPower: 260, efficiency: 15.1 },
		{ month: 'Mar', energy: 520, peakPower: 330, efficiency: 16.4 },
		{ month: 'Apr', energy: 610, peakPower: 390, efficiency: 17.8 },
		{ month: 'May', energy: 720, peakPower: 450, efficiency: 18.3 },
		{ month: 'Jun', energy: 760, peakPower: 480, efficiency: 18.9 },
		{ month: 'Jul', energy: 740, peakPower: 470, efficiency: 18.1 },
		{ month: 'Aug', energy: 680, peakPower: 430, efficiency: 17.2 },
		{ month: 'Sep', energy: 560, peakPower: 360, efficiency: 16.5 },
		{ month: 'Oct', energy: 430, peakPower: 290, efficiency: 15.6 },
		{ month: 'Nov', energy: 330, peakPower: 220, efficiency: 14.4 },
		{ month: 'Dec', energy: 280, peakPower: 190, efficiency: 13.8 }
	];
	export { data };

	// Left axis (energy + peak power) and right axis (efficiency) each get their own domain
	const yScale = scaleLinear()
		.domain([0, max(data, (d) => Math.max(d.energy, d.peakPower)) ?? 0])
		.nice();
	const efficiencyScale = scaleLinear()
		.domain([0, max(data, (d) => d.efficiency) ?? 0])
		.nice();

	// Remap efficiency into the left axis' domain so it shares the chart's `y` scale
	const efficiencyToY = scaleLinear().domain(efficiencyScale.domain()).range(yScale.domain());
</script>

<BarChart
	{data}
	x="month"
	yDomain={yScale.domain()}
	series={[
		{ key: 'energy', label: 'Energy (kWh)', color: 'var(--color-primary)' },
		{ key: 'peakPower', label: 'Peak power (kW)', color: 'var(--color-secondary)' },
		{
			key: 'efficiency',
			label: 'Efficiency (%)',
			value: (d) => efficiencyToY(d.efficiency),
			color: 'var(--color-success)'
		}
	]}
	seriesLayout="group"
	legend
	padding={defaultChartPadding({ top: 8, left: 48, right: 48, legend: true })}
	height={300}
>
	{#snippet axis({ context })}
		<Axis placement="left" rule label="Energy / Peak power" labelPlacement="middle" />
		<Axis
			placement="right"
			scale={scaleLinear(efficiencyScale.domain(), [context.height, 0])}
			format={(v) => `${v}%`}
			rule
			label="Efficiency"
			labelPlacement="middle"
		/>
		<Axis placement="bottom" />
	{/snippet}

	{#snippet tooltip({ context })}
		<Tooltip.Root {context}>
			{#snippet children({ data })}
				<Tooltip.Header value={data.month} />
				<Tooltip.List>
					{#each context.series.visibleSeries as s (s.key)}
						<!-- Read the field rather than `s.value`, which holds efficiency's remapped value -->
						<Tooltip.Item
							label={s.label}
							value={data[s.key]}
							format={s.key === 'efficiency' ? undefined : 'integer'}
							color={s.color}
							valueAlign="right"
						/>
					{/each}
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</BarChart>
