<script module lang="ts">
	import { getCountries2020 } from '$lib/data.remote';
	import { scaleLog } from 'd3-scale';
	import { sortFunc } from '@layerstack/utils';

	const countries = await getCountries2020();
	// Place the largest items first so smaller ones nestle around them.
	const data = [...countries].sort(sortFunc('population', 'desc'));
</script>

<script lang="ts">
	import { Chart, Dodge, Text, Tooltip } from 'layerchart';

	export { data };
</script>

<Chart
	{data}
	x="lifeExpectancy"
	xNice
	r="population"
	rRange={[2, 40]}
	c="continent"
	cDomain={['Africa', 'Asia', 'Europe', 'North America', 'Oceania', 'South America']}
	cRange={[
		'var(--color-warning)',
		'var(--color-info)',
		'var(--color-success)',
		'var(--color-danger)',
		'var(--color-secondary)',
		'var(--color-primary)'
	]}
	padding={{ top: 12, bottom: 32, left: 12, right: 12 }}
	height={420}
	axis={{ placement: 'bottom', rule: true }}
	props={{ xAxis: { label: 'Life expectancy (log)' } }}
>
	{#snippet marks({ context })}
		<Dodge axis="y" anchor="middle" padding={1}>
			{#snippet children({ items })}
				{#each items as { data: country, x, y, r, index } (index)}
					<Text
						{x}
						{y}
						value={country.code2}
						fontSize={r * 1.1}
						textAnchor="middle"
						verticalAnchor="middle"
						fill={context.cScale?.(country.continent)}
						class="font-semibold"
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
				<Tooltip.Header>{data.name}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Continent" value={data.continent} />
					<Tooltip.Item label="Life expectancy" value="{data.lifeExpectancy.toFixed(1)} years" />
					<Tooltip.Item label="Population" value={data.population} format="metric" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
