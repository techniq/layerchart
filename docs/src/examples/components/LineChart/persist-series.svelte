<script lang="ts">
	import { LineChart, defaultChartPadding } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const STORAGE_KEY = 'layerchart:persist-series:selected-keys';

	const data = createDateSeries({
		count: 30,
		min: 10,
		max: 100,
		value: 'integer',
		keys: ['apples', 'bananas', 'oranges']
	});
	export { data };

	let context: any = $state();
	let loaded = false;

	$effect(() => {
		// wait for context to be available
		if (!context?.isMounted) return;

		// load from localStorage once
		if (!loaded) {
			loaded = true;
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				const keys = JSON.parse(saved);
				if (Array.isArray(keys)) {
					context.series.selectedKeys.current = keys;
				}
			}
			return;
		}

		// otherewise save to localStorage when selected keys change
		const keys = context?.series?.selectedKeys?.current;
		if (keys !== undefined) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
		}
	});
</script>

<div class="text-center pb-4 text-sm">
	Select desired series on the legend, reload the page, and they will persist.
</div>
<LineChart
	bind:context
	{data}
	x="date"
	series={[
		{ key: 'apples', color: 'var(--color-apples)' },
		{
			key: 'bananas',
			color: 'var(--color-bananas)'
		},
		{
			key: 'oranges',
			color: 'var(--color-oranges)'
		}
	]}
	padding={defaultChartPadding({ legend: true, right: 10 })}
	height={300}
	legend
/>
