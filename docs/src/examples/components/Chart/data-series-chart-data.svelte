<script lang="ts">
	import { Chart, Spline } from 'layerchart';

	let data = [
		{ date: new Date(2020, 0, 1), apples: 20, oranges: 15 },
		{ date: new Date(2021, 0, 1), apples: 30, oranges: 25 },
		{ date: new Date(2022, 0, 1), apples: 18, oranges: 28 },
		{ date: new Date(2023, 0, 1), apples: 55, oranges: 40 },
		{ date: new Date(2024, 0, 1), apples: 20, oranges: 22 },
		{ date: new Date(2025, 0, 1), apples: 10, oranges: 12 }
	];
</script>

<Chart
	{data}
	x="date"
	series={[
		{ key: 'apples', color: 'var(--color-apples)' },
		{ key: 'oranges', color: 'var(--color-oranges)' }
	]}
	height={300}
>
	{#snippet marks()}
		<Spline seriesKey="apples" stroke="var(--color-apples)" />
		<Spline seriesKey="oranges" stroke="var(--color-oranges)" />
	{/snippet}
</Chart>
