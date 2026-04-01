<script lang="ts">
	import { Chart, Spline } from 'layerchart';

	let data = [
		{ date: new Date(2020, 0, 1), value: 20 },
		{ date: new Date(2021, 0, 1), value: 30 },
		{ date: new Date(2022, 0, 1), value: 18 },
		{ date: new Date(2023, 0, 1), value: 55 },
		{ date: new Date(2024, 0, 1), value: 20 },
		{ date: new Date(2025, 0, 1), value: 10 }
	];
</script>

<Chart {data} x="date" y="value" height={300}>
	{#snippet marks()}
		<Spline />
	{/snippet}
</Chart>
