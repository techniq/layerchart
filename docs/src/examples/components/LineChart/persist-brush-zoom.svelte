<script lang="ts">
	import { LineChart, Chart, Area, Layer, defaultChartPadding, type ChartState } from 'layerchart';
	import { getAppleStock } from '$lib/data.remote';

	const STORAGE_KEY = 'layerchart:persist-brush-zoom:range';

	const data = $derived(await getAppleStock());
	let context = $state<ChartState>();
	let loaded = false;

	$effect(() => {
		// wait for context
		if (!context?.isMounted) return;

		if (!loaded) {
			// load from localStorage once
			loaded = true;
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				const parsed = JSON.parse(saved);
				if (Array.isArray(parsed) && parsed.length === 2) {
					context.zoomToBrush(
						{ x: [new Date(parsed[0]), new Date(parsed[1])], y: [null, null] },
						'x'
					);
				}
			}
			return;
		}

		// otherwise save to localStorage when brush range changes
		const range = context?.xDomain;
		if (range) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(range));
		}
	});
</script>

<div class="text-center pb-4 text-sm">
	Select desired brush range, reload the page, and it will persist.
</div>
<LineChart
	bind:context
	{data}
	x="date"
	y="value"
	yDomain={[0, null]}
	transform={{
		mode: 'domain',
		axis: 'x',
		scaleExtent: [1, 50],
		domainExtent: {
			x: { min: 'data', max: 'data', minRange: 7 * 24 * 60 * 60 * 1000 }
		}
	}}
	clip
	padding={defaultChartPadding({ left: 25, bottom: 24 })}
	height={300}
/>

<Chart
	{data}
	x="date"
	y="value"
	padding={{ left: 16 }}
	brush={{
		x: context?.xDomain,
		onChange: (e) => {
			if (context && e.brush.active) {
				context.zoomToBrush(e.brush, 'x');
			}
		},
		onBrushEnd: (e) => {
			if (context && !e.brush.active) {
				context.transform.reset();
				localStorage.removeItem(STORAGE_KEY);
			}
		}
	}}
	height={40}
>
	<Layer>
		<Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
	</Layer>
</Chart>
