<script module lang="ts">
	import { getCountryGdpLifeExpectancy } from '$lib/data.remote';
	const data = await getCountryGdpLifeExpectancy();
</script>

<script lang="ts">
	import { Chart, Circle, Dodge, Tooltip } from 'layerchart';

	export { data };
</script>

<Chart
	{data}
	x="y"
	xNice
	r="value"
	rRange={[2, 20]}
	c="continent"
	cDomain={['africa', 'americas', 'asia', 'europe', 'oceania']}
	cRange={[
		'var(--color-warning)',
		'var(--color-danger)',
		'var(--color-info)',
		'var(--color-success)',
		'var(--color-secondary)'
	]}
	padding={{ top: 12, bottom: 32, left: 12, right: 12 }}
	height={320}
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
