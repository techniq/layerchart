<script lang="ts">
	import { Chart, Spline } from 'layerchart';

	let temperatureData = [
		{ date: new Date(2020, 0, 1), value: 32 },
		{ date: new Date(2021, 0, 1), value: 35 },
		{ date: new Date(2022, 0, 1), value: 28 },
		{ date: new Date(2023, 0, 1), value: 40 },
		{ date: new Date(2024, 0, 1), value: 38 },
		{ date: new Date(2025, 0, 1), value: 30 }
	];

	let humidityData = [
		{ date: new Date(2020, 0, 1), value: 60 },
		{ date: new Date(2021, 0, 1), value: 55 },
		{ date: new Date(2022, 0, 1), value: 70 },
		{ date: new Date(2023, 0, 1), value: 65 },
		{ date: new Date(2024, 0, 1), value: 50 },
		{ date: new Date(2025, 0, 1), value: 68 }
	];
</script>

<Chart x="date" y="value" height={300}>
	{#snippet marks()}
		<Spline data={temperatureData} stroke="var(--color-apples)" />
		<Spline data={humidityData} stroke="var(--color-oranges)" />
	{/snippet}
</Chart>
