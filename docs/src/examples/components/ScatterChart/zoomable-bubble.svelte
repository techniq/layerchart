<script lang="ts">
	import { CircleLegend, defaultChartPadding, Legend, ScatterChart, Tooltip } from 'layerchart';
	import { getCountries2020 } from '$lib/data.remote';
	import { flatGroup } from 'd3-array';

	const continentColors: Record<string, string> = {
		Asia: '#eea638',
		Europe: '#d8854f',
		Africa: '#de4c4f',
		'South America': '#86a965',
		'North America': '#a7a737',
		Oceania: '#8aabb0'
	};

	const data = $derived(flatGroup(await getCountries2020(), (d) => d.continent));
	export { data };
</script>

<ScatterChart
	x="gdpPerCapita"
	y="lifeExpectancy"
	r="population"
	rRange={[3, 50]}
	xPadding={[15, 5]}
	yPadding={[5, 20]}
	series={data.map(([continent, items]) => {
		const color = continentColors[continent] ?? 'var(--color-primary)';
		return {
			key: continent,
			data: items,
			color,
			props: {
				fill: color,
				fillOpacity: 0.5,
				stroke: 'none'
			}
		};
	})}
	transform={{
		mode: 'domain',
		scaleExtent: [1, 20],
		domainExtent: { x: { min: 'data', max: 'data' }, y: { min: 'data', max: 'data' } }
	}}
	highlight={{ lines: true, points: true, axis: 'both', r: true }}
	rule={false}
	padding={defaultChartPadding({ top: 20, bottom: 48, left: 20, right: 20 })}
	height={500}
>
	{#snippet legend()}
		<Legend placement="bottom" />
		<CircleLegend
			title="Population"
			placement="bottom-right"
			labelPlacement="left"
			tickFormat="metric"
			class="mr-4 mb-14"
		/>
	{/snippet}
	{#snippet tooltip()}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.name}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="GDP per capita" value={data.gdpPerCapita} format="currency" />
					<Tooltip.Item label="Life expectancy" value={data.lifeExpectancy} format="decimal" />
					<Tooltip.Item label="Population" value={data.population} format="integer" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</ScatterChart>
