<script module lang="ts">
	import { getSvelteMilestones } from '$lib/data.remote';
	const milestones = await getSvelteMilestones();
</script>

<script lang="ts">
	import { ascending } from 'd3-array';
	import { Chart, Circle, Dodge, Line, Text } from 'layerchart';

	type Item = {
		date: Date;
		category: 'svelte' | 'sveltekit' | 'ecosystem';
		label: string;
		side: 'above' | 'below';
	};

	// Split by category: Svelte + Ecosystem above the baseline, SvelteKit below.
	const data: Item[] = milestones
		.map((m) => ({
			date: m.date,
			category: m.category,
			label: m.label.replace(/\n/g, ' '),
			side: m.category === 'sveltekit' ? ('below' as const) : ('above' as const)
		}))
		.sort((a, b) => ascending(a.date, b.date));

	const series = [
		{ key: 'svelte', label: 'Svelte', color: 'var(--color-danger)' },
		{ key: 'sveltekit', label: 'SvelteKit', color: 'var(--color-surface-content)' },
		{ key: 'ecosystem', label: 'Ecosystem', color: 'var(--color-info)' }
	];

	function labelHalfWidth(label: string) {
		return (label.length * 6.5) / 2;
	}

	export { data };
</script>

<Chart
	{data}
	x="date"
	{series}
	padding={{ top: 12, bottom: 12 }}
	xPadding={[50, 50]}
	height={400}
	transform={{
		mode: 'domain',
		axis: 'x',
		scaleExtent: [1, 50],
		domainExtent: { x: { min: 'data', max: 'data' } }
	}}
	motion={{ type: 'spring' }}
	clip
	axis={false}
	rule={false}
	grid={false}
	legend={{ placement: 'top', variant: 'swatches' }}
>
	{#snippet marks({ context })}
		{@const visibleSeries = context.series.visibleSeries}
		{@const visibleKeys = new Set(visibleSeries.map((s) => s.key))}
		{@const visibleData = data.filter((d) => visibleKeys.has(d.category))}
		{@const baselineY = context.height / 2}
		{@const above = visibleData.filter((d) => d.side === 'above')}
		{@const below = visibleData.filter((d) => d.side === 'below')}

		<Line
			x1={0}
			x2={context.width}
			y1={baselineY}
			y2={baselineY}
			class="stroke-surface-content/40"
		/>

		<!-- Above: stack upward from the baseline -->
		<Dodge
			data={above}
			axis="y"
			anchor="bottom"
			size={baselineY}
			padding={4}
			rowHeight={16}
			r={(d) => labelHalfWidth(d.label)}
		>
			{#snippet children({ items: dodged })}
				{#each dodged as { data: item, x, y, index } (index)}
					{@const series = visibleSeries.find((s) => s.key === item.category)}
					{@const opacity = context.series.isHighlighted(item.category, true) ? 1 : 0.2}
					{@const labelY = y - 6}

					<Line x1={x} x2={x} y1={baselineY - 4} y2={labelY + 6} opacity={0.25 * opacity} />
					<Circle
						cx={x}
						cy={baselineY}
						r={3}
						fill={series?.color}
						{opacity}
						class="stroke-surface-100"
					/>
					<Text
						{x}
						y={labelY}
						value={item.label}
						textAnchor="middle"
						verticalAnchor="middle"
						fill={series?.color}
						{opacity}
						class="text-[11px]"
					/>
				{/each}
			{/snippet}
		</Dodge>

		<!-- Below: stack downward from the baseline (translate result by +baselineY) -->
		<Dodge
			data={below}
			axis="y"
			anchor="top"
			size={context.height - baselineY}
			padding={4}
			rowHeight={16}
			r={(d) => labelHalfWidth(d.label)}
		>
			{#snippet children({ items: dodged })}
				{#each dodged as { data: item, x, y, index } (index)}
					{@const series = visibleSeries.find((s) => s.key === item.category)}
					{@const opacity = context.series.isHighlighted(item.category, true) ? 1 : 0.2}
					{@const labelY = y + baselineY + 6}

					<Line x1={x} x2={x} y1={baselineY + 4} y2={labelY - 6} opacity={0.25 * opacity} />
					<Circle
						cx={x}
						cy={baselineY}
						r={3}
						fill={series?.color}
						{opacity}
						class="stroke-surface-100"
					/>
					<Text
						{x}
						y={labelY}
						value={item.label}
						textAnchor="middle"
						verticalAnchor="middle"
						fill={series?.color}
						{opacity}
						class="text-[11px]"
					/>
				{/each}
			{/snippet}
		</Dodge>
	{/snippet}
</Chart>
