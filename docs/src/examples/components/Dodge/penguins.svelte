<script module lang="ts">
	import { getPenguins } from '$lib/data.remote';
	const penguins = await getPenguins();
</script>

<script lang="ts">
	import { Chart, Circle, Dodge, Tooltip } from 'layerchart';

	const data = penguins.filter((d) => d.body_mass_g != null);

	export { data };
</script>

<Chart
	{data}
	x="body_mass_g"
	xNice
	series={[
		{ key: 'Adelie', label: 'Adelie', color: 'var(--color-info)' },
		{ key: 'Chinstrap', label: 'Chinstrap', color: 'var(--color-success)' },
		{ key: 'Gentoo', label: 'Gentoo', color: 'var(--color-warning)' }
	]}
	padding={{ top: 20, bottom: 32, left: 12, right: 12 }}
	height={320}
	axis="x"
	legend={{ placement: 'top', variant: 'swatches' }}
	props={{ xAxis: { label: 'Body mass (g)' } }}
>
	{#snippet marks({ context })}
		{@const visibleSeries = context.series.visibleSeries}
		{@const visibleKeys = new Set(visibleSeries.map((s) => s.key))}
		{@const visibleItems = data.filter((d) => visibleKeys.has(d.species))}

		<Dodge data={visibleItems} axis="y" anchor="bottom" r={4} padding={1}>
			{#snippet children({ items: dodged })}
				{#each dodged as { data: p, x, y, r, index } (index)}
					{@const series = visibleSeries.find((s) => s.key === p.species)}
					{@const opacity = context.series.isHighlighted(p.species, true) ? 1 : 0.2}
					<Circle
						cx={x}
						cy={y}
						{r}
						fill={series?.color}
						{opacity}
						class="stroke-surface-100"
						onpointermove={(e) => context.tooltip.show(e, p)}
						onpointerleave={context.tooltip.hide}
					/>
				{/each}
			{/snippet}
		</Dodge>
	{/snippet}

	{#snippet tooltip({ context })}
		<Tooltip.Root {context}>
			{#snippet children({ data })}
				<Tooltip.Header>{data.species}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Body mass" value="{data.body_mass_g} g" />
					<Tooltip.Item label="Flipper length" value="{data.flipper_length_mm} mm" />
					<Tooltip.Item label="Sex" value={data.sex ?? 'unknown'} />
					<Tooltip.Item label="Island" value={data.island} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
