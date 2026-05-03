<script module lang="ts">
	import { getCountryGdpLifeExpectancy } from '$lib/data.remote';
	const countries = await getCountryGdpLifeExpectancy();
</script>

<script lang="ts">
	import { scaleSqrt, scaleOrdinal } from 'd3-scale';
	import { Chart, Circle, Dodge, Tooltip } from 'layerchart';

	const items = countries.filter(
		(d): d is typeof d & { y: number; value: number } => d.y != null && d.value != null
	);

	const continentColor = scaleOrdinal(
		['africa', 'americas', 'asia', 'europe', 'oceania'],
		[
			'var(--color-warning)',
			'var(--color-danger)',
			'var(--color-info)',
			'var(--color-success)',
			'var(--color-secondary)'
		]
	);

	export const data = items;
</script>

<Chart
	data={items}
	x="y"
	xNice
	r="value"
	rScale={scaleSqrt()}
	rRange={[2, 20]}
	padding={{ top: 12, bottom: 32, left: 12, right: 12 }}
	height={420}
	axis="x"
	rule={false}
	props={{ xAxis: { label: 'Life expectancy (years)' } }}
>
	{#snippet marks({ context })}
		<Dodge axis="y" anchor="bottom" padding={1}>
			{#snippet children({ items: dodged })}
				{#each dodged as { data: country, x, y, r, index } (index)}
					<Circle
						cx={x}
						cy={y}
						{r}
						fill={continentColor(country.continent)}
						class="stroke-surface-100 opacity-80"
						onpointermove={(e) => context.tooltip.show(e, country)}
						onpointerleave={context.tooltip.hide}
					/>
				{/each}
			{/snippet}
		</Dodge>
	{/snippet}

	{#snippet tooltip({ context })}
		<Tooltip.Root {context}>
			{#snippet children({ data })}
				<Tooltip.Header>{data.title}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Continent" value={data.continent} />
					<Tooltip.Item label="Life expectancy" value="{data.y.toFixed(1)} years" />
					<Tooltip.Item label="Population" value={data.value} format="metric" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
