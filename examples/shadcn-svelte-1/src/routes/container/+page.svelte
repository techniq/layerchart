<script lang="ts">
	import { ArcChart, AreaChart, BarChart, LineChart, PieChart, ScatterChart } from 'layerchart';
	import * as Chart from '$lib/components/ui/chart/index.js';

	const data = [
		{ date: new Date('2025-01-01T00:00'), value: 30 },
		{ date: new Date('2025-02-01T00:00'), value: 50 },
		{ date: new Date('2025-03-01T00:00'), value: 40 },
		{ date: new Date('2025-04-01T00:00'), value: 70 },
		{ date: new Date('2025-05-01T00:00'), value: 60 },
		{ date: new Date('2025-06-01T00:00'), value: 90 }
	];

	const chartConfig = {
		default: { label: 'Value', color: 'var(--chart-1)' }
	} satisfies Chart.ChartConfig;

	const pieData = [
		{
			fruit: 'apples',
			value: 3840,
			color: 'var(--chart-1)'
		},
		{
			fruit: 'bananas',
			value: 1920,
			color: 'var(--chart-2)'
		},
		{
			fruit: 'cherries',
			value: 960,
			color: 'var(--chart-3)'
		},
		{
			fruit: 'grapes',
			value: 400,
			color: 'var(--chart-4)'
		}
	];
	const pieChartConfig = {
		apples: { label: 'Apples', color: 'var(--chart-1)' },
		bananas: { label: 'Bananas', color: 'var(--chart-2)' },
		cherries: { label: 'Cherries', color: 'var(--chart-3)' },
		grapes: { label: 'Grapes', color: 'var(--chart-4)' }
	} satisfies Chart.ChartConfig;

	const arcChartConfig = {
		example: { label: 'Example', color: 'var(--chart-2)' }
	} satisfies Chart.ChartConfig;
</script>

<div class="grid grid-cols-2 gap-10">
	<Chart.Container config={chartConfig} class="h-[200px] w-full">
		<AreaChart {data} x="date" y="value">
			{#snippet tooltip()}
				<Chart.Tooltip labelFormatter={(value) => value.toLocaleDateString()} />
			{/snippet}
		</AreaChart>
	</Chart.Container>

	<Chart.Container config={chartConfig} class="h-[200px] w-full">
		<LineChart {data} x="date" y="value">
			{#snippet tooltip()}
				<Chart.Tooltip labelFormatter={(value) => value.toLocaleDateString()} />
			{/snippet}
		</LineChart>
	</Chart.Container>

	<Chart.Container config={chartConfig} class="h-[200px] w-full">
		<BarChart {data} x="date" y="value">
			{#snippet tooltip()}
				<Chart.Tooltip labelFormatter={(value) => value.toLocaleDateString()} />
			{/snippet}
		</BarChart>
	</Chart.Container>

	<Chart.Container config={chartConfig} class="h-[200px] w-full">
		<ScatterChart {data} x="date" y="value">
			<!-- TODO: Why is this not showing anything? -->
			<!-- {#snippet tooltip()}
				<Chart.Tooltip />
			{/snippet} -->
		</ScatterChart>
	</Chart.Container>

	<Chart.Container config={pieChartConfig} class="h-[200px] w-full">
		<PieChart
			data={pieData}
			key="fruit"
			value="value"
			cRange={Object.values(pieChartConfig).map((c) => c.color)}
		>
			{#snippet tooltip()}
				<Chart.Tooltip hideLabel />
			{/snippet}
		</PieChart>
	</Chart.Container>

	<Chart.Container config={arcChartConfig} class="h-[200px] w-full">
		<ArcChart
			data={[{ key: 'example', value: 70, color: 'var(--chart-2)' }]}
			maxValue={100}
			innerRadius={-20}
			cornerRadius={10}
		>
			{#snippet tooltip()}
				<Chart.Tooltip hideLabel />
			{/snippet}
		</ArcChart>
	</Chart.Container>
</div>
