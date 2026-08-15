<script lang="ts">
	import { Chart, Spline } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { pivotLonger } from 'layerchart';

	const keys = ['apples', 'bananas', 'oranges'];
	const wide = createDateSeries({ count: 30, min: 10, max: 100, value: 'integer', keys });
	const data = pivotLonger(wide, keys, 'fruit', 'value');
	export { data };

	const series = keys.map((key) => ({ key, color: `var(--color-${key})` }));
</script>

<!-- A panel per series, each drawn by the same mark against the shared scales -->
<Chart
	{data}
	x="date"
	y="value"
	fx="fruit"
	yDomain={[0, null]}
	yNice
	{series}
	padding={{ left: 44, bottom: 32, top: 24, right: 8 }}
	height={260}
>
	{#snippet marks()}
		<Spline stroke="fruit" class="stroke-2" />
	{/snippet}
</Chart>
