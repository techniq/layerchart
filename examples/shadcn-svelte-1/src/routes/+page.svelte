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

<div class="grid grid-cols-2 gap-10">
	<div class="h-[200px]">
		<AreaChart {data} x="date" y="value" />
	</div>

	<div class="h-[200px]">
		<LineChart {data} x="date" y="value" />
	</div>

	<div class="h-[200px]">
		<BarChart {data} x="date" y="value" />
	</div>

	<div class="h-[200px]">
		<ScatterChart {data} x="date" y="value" />
	</div>

	<div class="h-[200px]">
		<PieChart data={pieData} key="fruit" value="value" />
	</div>

	<div class="h-[200px]">
		<ArcChart
			data={[{ key: 'Example', value: 70 }]}
			maxValue={100}
			innerRadius={-20}
			cornerRadius={10}
		/>
	</div>
</div>
