<script lang="ts">
	import { ArcChart, AreaChart, BarChart, LineChart, PieChart, ScatterChart } from 'layerchart';

	const data = [
		{ date: new Date('2025-01-01T00:00'), value: 30 },
		{ date: new Date('2025-02-01T00:00'), value: 50 },
		{ date: new Date('2025-03-01T00:00'), value: 40 },
		{ date: new Date('2025-04-01T00:00'), value: 70 },
		{ date: new Date('2025-05-01T00:00'), value: 60 },
		{ date: new Date('2025-06-01T00:00'), value: 90 }
	];

	const pieData = [
		{
			fruit: 'Apples',
			value: 3840
		},
		{
			fruit: 'Bananas',
			value: 1920
		},
		{
			fruit: 'Cherries',
			value: 960
		},
		{
			fruit: 'Grapes',
			value: 400
		}
	];
</script>

<main>
	<div class="chart">
		<AreaChart {data} x="date" y="value" />
	</div>

	<div class="chart">
		<LineChart {data} x="date" y="value" />
	</div>

	<div class="chart">
		<BarChart {data} x="date" y="value" />
	</div>

	<div class="chart">
		<ScatterChart {data} x="date" y="value" />
	</div>

	<div class="chart">
		<PieChart data={pieData} key="fruit" value="value" />
	</div>

	<div class="chart">
		<ArcChart
			data={[{ key: 'Example', value: 70 }]}
			maxValue={100}
			innerRadius={-20}
			cornerRadius={10}
		/>
	</div>
</main>

<style>
	main {
		padding: 20px;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 40px;
	}

	.chart {
		height: 200px;
	}
</style>
