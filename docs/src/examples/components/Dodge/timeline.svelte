<script module lang="ts">
	import { getSvelteMilestones } from '$lib/data.remote';
	const milestones = await getSvelteMilestones();
</script>

<script lang="ts">
	import { Chart, Circle, Dodge, Layer, Line, Text } from 'layerchart';

	type Item = {
		date: Date;
		category: 'svelte' | 'sveltekit' | 'ecosystem';
		label: string;
	};

	const data: Item[] = milestones.map((m) => ({
		date: m.date,
		category: m.category,
		label: m.label.replace(/\n/g, ' ')
	}));

	/** Estimate the half width of a label based on its character length */
	function labelHalfWidth(label: string) {
		return (label.length * 6.5) / 2;
	}

	export { data };
</script>

<Chart
	{data}
	x="date"
	series={[
		{ key: 'svelte', label: 'Svelte', color: 'var(--color-danger)' },
		{ key: 'sveltekit', label: 'SvelteKit', color: 'var(--color-surface-content)' },
		{ key: 'ecosystem', label: 'Ecosystem', color: 'var(--color-info)' }
	]}
	padding={{ top: 24, bottom: 24 }}
	xPadding={[50, 50]}
	height={360}
	transform={{
		mode: 'domain',
		axis: 'x',
		scaleExtent: [1, 50],
		domainExtent: { x: { min: 'data', max: 'data' } }
	}}
	motion={{ type: 'spring' }}
	clip
	axis="x"
	legend={{ placement: 'top', variant: 'swatches' }}
>
	{#snippet aboveContext({ context })}
		{@const visibleSeries = context.series.visibleSeries}
		{@const visibleKeys = new Set(visibleSeries.map((s) => s.key))}
		{@const visibleItems = data.filter((d) => visibleKeys.has(d.category))}
		{@const baselineY = context.height}

		<Layer>
			<Dodge
				data={visibleItems}
				axis="y"
				anchor="bottom"
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
		</Layer>
	{/snippet}
</Chart>
