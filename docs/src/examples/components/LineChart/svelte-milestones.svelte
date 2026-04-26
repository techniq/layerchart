<script module lang="ts">
	import { getSvelteCounts, getSvelteMilestones } from '$lib/data.remote';
	const [counts, milestones] = await Promise.all([getSvelteCounts(), getSvelteMilestones()]);
</script>

<script lang="ts">
	import { AnnotationPoint, defaultChartPadding, Layer, LineChart } from 'layerchart';
	import type { ComponentProps } from 'svelte';
	import { bisector } from 'd3-array';

	const svelteSeries = counts.filter((d) => d.category === 'svelte');
	const sveltekitSeries = counts.filter((d) => d.category === 'sveltekit');

	const bisect = bisector<{ date: Date }, Date>((d) => d.date).right;

	function cumsumAt(series: typeof svelteSeries, date: Date) {
		const i = bisect(series, date) - 1;
		return i >= 0 ? series[i].cumsum : 0;
	}

	let context = $state<ComponentProps<typeof LineChart>['context']>();

	// Extend the y-domain so the tallest visible milestone label fits in-chart —
	// matters most when only SvelteKit is selected (its data max is well below
	// the tallest sveltekit label, e.g. "stream file uploads" at y=245).
	const yPaddingTop = $derived.by(() => {
		const selectedKeys = context?.series.selectedKeys;
		// if (!selectedKeys || selectedKeys.isEmpty()) return 20;
		return selectedKeys?.isSelected('sveltekit') && !selectedKeys.isSelected('svelte') ? 40 : 20;
	});

	export const data = { counts, milestones };
</script>

<LineChart
	bind:context
	x="date"
	y="cumsum"
	series={[
		{ key: 'svelte', label: 'Svelte', data: svelteSeries, color: 'var(--color-danger)' },
		{
			key: 'sveltekit',
			label: 'SvelteKit',
			data: sveltekitSeries,
			color: 'var(--color-surface-content)'
		}
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
			{#each milestones.filter((m) => selectedKeys.isEmpty() || (m.category !== 'ecosystem' && selectedKeys.isSelected(m.category))) as m, i (i)}
				{@const dotDomainY =
					m.category === 'ecosystem'
						? undefined
						: cumsumAt(m.category === 'svelte' ? svelteSeries : sveltekitSeries, m.date)}
				{@const dotPxY = dotDomainY == null ? context.height : context.yScale(dotDomainY)}
				{@const dx = context.xScale(m.x) - context.xScale(m.date)}
				{@const dy = context.yScale(m.y) - dotPxY}
				{@const h = dx >= 0 ? 'right' : 'left'}
				{@const v = dy >= 0 ? 'bottom' : 'top'}

				<AnnotationPoint
					x={m.date}
					y={dotDomainY}
					r={3}
					label={m.label}
					labelPlacement="{v}-{h}"
					labelXOffset={Math.abs(dx)}
					labelYOffset={Math.abs(dy)}
					link={{ type: 'swoop', bend: dx >= 0 ? 22.5 : -22.5, class: 'opacity-30' }}
					props={{
						circle: {
							fill:
								m.category === 'svelte' ? 'var(--color-danger)' : 'var(--color-surface-content)',
							class: 'stroke-surface-100'
						},
						label: { class: 'text-[11px] fill-surface-content', verticalAnchor: 'middle' }
					}}
				/>
			{/each}
		</Layer>
	{/snippet}
</LineChart>
