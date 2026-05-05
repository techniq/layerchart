<script module lang="ts">
	import { getSvelteCounts, getSvelteMilestones } from '$lib/data.remote';
	const [counts, milestones] = await Promise.all([getSvelteCounts(), getSvelteMilestones()]);
</script>

<script lang="ts">
	import { AnnotationPoint, defaultChartPadding, Layer, LineChart } from 'layerchart';
	import type { ComponentProps } from 'svelte';
	import { bisector, extent, max } from 'd3-array';

	const svelteSeries = counts.filter((d) => d.category === 'svelte');
	const sveltekitSeries = counts.filter((d) => d.category === 'sveltekit');

	// Fallback domains used only when no spline series is visible (i.e. when
	// Ecosystem alone is selected — it has no data of its own, so the chart
	// would otherwise have nothing to derive the axes from). When at least
	// one spline is visible we leave the domains unset and let the chart's
	// auto-derive shrink the y-axis to fit just the visible series' data.
	const allCounts = [...svelteSeries, ...sveltekitSeries];
	const fallbackXDomain = extent(allCounts, (d) => d.date) as [Date, Date];
	const fallbackYMax = max(allCounts, (d) => d.cumsum) ?? 0;

	const hasVisibleSpline = $derived.by(() => {
		const selectedKeys = context?.series.selectedKeys;
		if (!selectedKeys || selectedKeys.isEmpty()) return true;
		return selectedKeys.isSelected('svelte') || selectedKeys.isSelected('sveltekit');
	});
	const xDomain = $derived(hasVisibleSpline ? undefined : fallbackXDomain);
	const yDomain = $derived(hasVisibleSpline ? undefined : ([0, fallbackYMax] as [number, number]));

	const bisect = bisector<{ date: Date }, Date>((d) => d.date).right;

	function cumsumAt(series: typeof svelteSeries, date: Date) {
		const i = bisect(series, date) - 1;
		return i >= 0 ? series[i].cumsum : 0;
	}

	const seriesColor = {
		svelte: 'var(--color-danger)',
		sveltekit: 'var(--color-surface-content)',
		ecosystem: 'var(--color-info)'
	} as const;

	let context = $state<ComponentProps<typeof LineChart>['context']>();

	// Extend the y-domain so the tallest visible milestone label fits in-chart —
	// matters most when only SvelteKit is selected (its data max is well below
	// the tallest sveltekit label, e.g. "stream file uploads" at y=245).
	const yPaddingTop = $derived.by(() => {
		const selectedKeys = context?.series.selectedKeys;
		return selectedKeys?.isSelected('sveltekit') && !selectedKeys.isSelected('svelte') ? 40 : 20;
	});

	export const data = { counts, milestones };
</script>

<LineChart
	bind:context
	x="date"
	{xDomain}
	y="cumsum"
	{yDomain}
	series={[
		{ key: 'svelte', label: 'Svelte', data: svelteSeries, color: seriesColor.svelte },
		{
			key: 'sveltekit',
			label: 'SvelteKit',
			data: sveltekitSeries,
			color: seriesColor.sveltekit
		},
		// Metadata-only series — drives the legend swatch and milestone visibility
		// toggling. No spline rendered for it (handled in the marks snippet).
		{ key: 'ecosystem', label: 'Ecosystem', color: seriesColor.ecosystem }
	]}
	padding={defaultChartPadding({ legend: true, top: 20, left: 30, right: 14, bottom: 20 })}
	yPadding={[0, yPaddingTop]}
	height={400}
	brush
	transform={{
		mode: 'domain',
		axis: 'x',
		scaleExtent: [1, 50],
		domainExtent: { x: { min: 'data', max: 'data' } }
	}}
	motion={{ type: 'spring' }}
	clip
	legend
>
	{#snippet aboveContext({ context })}
		{@const selectedKeys = context.series.selectedKeys}
		<Layer>
			{#each milestones.filter((m) => selectedKeys.isEmpty() || selectedKeys.isSelected(m.category)) as m, i (i)}
				{@const dotDomainY =
					m.category === 'ecosystem'
						? undefined
						: cumsumAt(m.category === 'svelte' ? svelteSeries : sveltekitSeries, m.date)}
				{@const h = m.dx >= 0 ? 'right' : 'left'}
				{@const v = m.dy >= 0 ? 'bottom' : 'top'}

				<AnnotationPoint
					x={m.date}
					y={dotDomainY}
					r={3}
					label={m.label}
					labelPlacement="{v}-{h}"
					labelXOffset={Math.abs(m.dx)}
					labelYOffset={Math.abs(m.dy)}
					link={{ type: 'swoop', bend: m.dx >= 0 ? 22.5 : -22.5, class: 'opacity-30' }}
					props={{
						circle: { fill: seriesColor[m.category], class: 'stroke-surface-100' },
						label: { class: 'text-[11px] fill-surface-content', verticalAnchor: 'middle' }
					}}
				/>
			{/each}
		</Layer>
	{/snippet}
</LineChart>
