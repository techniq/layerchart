<script module lang="ts">
	import { getPenguins } from '$lib/data.remote';
	const data = await getPenguins();
</script>

<script lang="ts">
	import { Chart, Circle, Dodge, Tooltip } from 'layerchart';

	export { data };
</script>

<Chart
	{data}
	y="species"
	bandPadding={0.2}
	x="body_mass_g"
	xNice
	series={[
		{ key: 'female', label: 'Female', color: 'var(--color-warning)' },
		{ key: 'male', label: 'Male', color: 'var(--color-info)' }
	]}
	padding={{ top: 12, bottom: 32, left: 80, right: 12 }}
	height={400}
	valueAxis="x"
	legend={{ placement: 'top', variant: 'swatches' }}
>
	{#snippet marks({ context })}
		{@const bandwidth = context.yScale.bandwidth?.() ?? 0}
		{@const visibleSeries = context.series.visibleSeries}
		{@const visibleKeys = new Set(visibleSeries.map((s) => s.key))}
		{@const visibleData = data.filter((d) => visibleKeys.has(d.sex))}

		{#each context.yDomain as s (s)}
			{@const bandTop = context.yScale(s) ?? 0}
			{@const items = visibleData.filter((d) => d.species === s)}

			<Dodge
				data={items}
				axis="y"
				anchor="middle"
				size={bandwidth}
				r={3}
				padding={1}
				position={(d) => Number(context.xGet(d)) || 0}
			>
				{#snippet children({ items: dodged })}
					{#each dodged as { data: p, x, y, r, index } (index)}
						{@const series = visibleSeries.find((vs) => vs.key === p.sex)}
						{@const opacity = context.series.isHighlighted(p.sex, true) ? 1 : 0.2}
						<Circle
							cx={x}
							cy={y + bandTop}
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
		{/each}
	{/snippet}

	{#snippet tooltip({ context })}
		<Tooltip.Root {context}>
			{#snippet children({ data })}
				<Tooltip.Header>{data.species}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Body mass" value="{data.body_mass_g} g" />
					<Tooltip.Item label="Sex" value={data.sex} />
					<Tooltip.Item label="Island" value={data.island} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
