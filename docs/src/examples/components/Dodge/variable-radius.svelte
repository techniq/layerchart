<script module lang="ts">
	import { getCountries2020 } from '$lib/data.remote';
	const data = await getCountries2020();
</script>

<script lang="ts">
	import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';
	import { sortFunc } from '@layerstack/utils';

	import { Chart, Circle, Dodge, Tooltip } from 'layerchart';

	export { data };

	type SortOrder = 'unsorted' | 'desc' | 'asc';
	let sortOrder = $state<SortOrder>('unsorted');
	let minRadius = $state(2);
	let maxRadius = $state(20);

	const sortedData = $derived.by(() => {
		if (sortOrder === 'unsorted') return data;
		// `sortFunc` is ascending by default; pass 'desc' for largest first.
		return [...data].sort(sortFunc('population', sortOrder));
	});
</script>

<div class="grid grid-cols-[auto_1fr_1fr] gap-4 mb-4 screenshot-hidden">
	<Field label="Sort" dense>
		<ToggleGroup bind:value={sortOrder} variant="outline" size="sm">
			<ToggleOption value="unsorted">Unsorted</ToggleOption>
			<ToggleOption value="desc">Largest first</ToggleOption>
			<ToggleOption value="asc">Smallest first</ToggleOption>
		</ToggleGroup>
	</Field>
	<RangeField label="Min radius" bind:value={minRadius} min={1} max={maxRadius - 1} />
	<RangeField label="Max radius" bind:value={maxRadius} min={minRadius + 1} max={50} />
</div>

<Chart
	data={sortedData}
	x="lifeExpectancy"
	xNice
	r="population"
	rRange={[minRadius, maxRadius]}
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
	height={400}
	axis={{ placement: 'bottom', rule: true }}
	props={{ xAxis: { label: 'Life expectancy (years)' } }}
>
	{#snippet marks({ context })}
		<Dodge axis="y" anchor="bottom" padding={0}>
			{#snippet children({ items: dodged })}
				{#each dodged as { data: country, x, y, r, index } (index)}
					<Circle
						data={[country]}
						cx={x}
						cy={y}
						{r}
						fill="continent"
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
