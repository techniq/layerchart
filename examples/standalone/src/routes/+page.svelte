<script lang="ts">
	import { AreaChart, LineChart } from 'layerchart';

	const data = [
		{ date: new Date('2023-01-01T00:00'), value: 30 },
		{ date: new Date('2023-02-01T00:00'), value: 50 },
		{ date: new Date('2023-03-01T00:00'), value: 40 },
		{ date: new Date('2023-04-01T00:00'), value: 70 },
		{ date: new Date('2023-05-01T00:00'), value: 60 },
		{ date: new Date('2023-06-01T00:00'), value: 90 }
	];
</script>

<main>
	<div class="chart">
		<AreaChart {data} x="date" y="value" />
	</div>

	<div class="chart">
		<LineChart {data} x="date" y="value" />
	</div>
</main>

<style>
	main {
		display: grid;
		gap: 40px;
	}

	.chart {
		height: 200px;
	}
</style>
