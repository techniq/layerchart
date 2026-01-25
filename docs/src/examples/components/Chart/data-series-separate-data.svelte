<script lang="ts">
	import { LineChart, Spline } from 'layerchart';

	let appleData = [
		{ date: new Date(2020, 0, 1), value: 20 },
		{ date: new Date(2021, 0, 1), value: 30 },
		{ date: new Date(2022, 0, 1), value: 18 },
		{ date: new Date(2023, 0, 1), value: 55 },
		{ date: new Date(2024, 0, 1), value: 20 },
		{ date: new Date(2025, 0, 1), value: 10 }
	];

	let orangeData = [
		{ date: new Date(2020, 0, 1), value: 15 },
		{ date: new Date(2021, 0, 1), value: 25 },
		{ date: new Date(2022, 0, 1), value: 28 },
		{ date: new Date(2023, 0, 1), value: 40 },
		{ date: new Date(2024, 0, 1), value: 22 },
		{ date: new Date(2025, 0, 1), value: 12 }
	];
</script>

<LineChart
	x="date"
	y="value"
	series={[
		{ key: 'apples', data: appleData, color: 'var(--color-apples)' },
		{ key: 'oranges', data: orangeData, color: 'var(--color-oranges)' }
	]}
	height={300}
>
	{#snippet marks()}
		<Spline seriesKey="apples" stroke="var(--color-apples)" />
		<Spline seriesKey="oranges" stroke="var(--color-oranges)" />
	{/snippet}
</LineChart>
