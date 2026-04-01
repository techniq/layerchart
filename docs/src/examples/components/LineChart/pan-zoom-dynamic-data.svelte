<script lang="ts">
	import { extent } from 'd3-array';
	import { useDebounce } from 'runed';
	import { LineChart, defaultChartPadding, type ChartState } from 'layerchart';
	import { ProgressCircle } from 'svelte-ux';
	import { getAppleStock, getAppleStockRange } from '$lib/data.remote';

	// Load full dataset for domain extent
	const allData = await getAppleStock();
	const xDomain = extent(allData, (d) => d.date) as [Date, Date];
	const yDomain = extent(allData, (d) => d.value) as [number, number];

	let context = $state<ChartState>(null!);
	let data = $state(await getAppleStockRange({}));
	let fetching = $state(false);

	const fetchData = useDebounce(async (lo: Date, hi: Date) => {
		fetching = true;
		data = await getAppleStockRange({
			start: lo.toISOString(),
			end: hi.toISOString()
		});
		fetching = false;
	}, 150);

	const loading = $derived(fetchData.pending || fetching);

	// Track previous domain to avoid redundant fetches
	let prevLo = 0;
	let prevHi = 0;

	// Fetch higher-resolution data when visible domain changes
	$effect(() => {
		if (!context?.xDomain) return;
		const [lo, hi] = context.xDomain as [Date, Date];
		const loTime = lo.getTime();
		const hiTime = hi.getTime();

		if (loTime === prevLo && hiTime === prevHi) return;
		prevLo = loTime;
		prevHi = hiTime;

		fetchData(lo, hi);
	});

	export { data };
</script>

<div class="flex items-center gap-2 text-sm text-surface-content/50 mb-1 h-0">
	{#if loading}<ProgressCircle size={16} width={2} />{/if}
</div>

<LineChart
	bind:context
	{data}
	x="date"
	y="value"
	{xDomain}
	{yDomain}
	transform={{
		mode: 'domain',
		axis: 'x',
		scaleExtent: [1, 50],
		domainExtent: { x: { min: xDomain[0], max: xDomain[1] } }
	}}
	padding={defaultChartPadding({ left: 25 })}
	height={300}
/>
