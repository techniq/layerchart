<script lang="ts">
	import { CircleLegend, defaultChartPadding, Legend, ScatterChart, Tooltip } from 'layerchart';
	import { getCountryGdpLifeExpectancy } from '$lib/data.remote';
	import { flatGroup } from 'd3-array';

	const continentColors: Record<string, string> = {
		asia: '#eea638',
		europe: '#d8854f',
		africa: '#de4c4f',
		south_america: '#86a965',
		north_america: '#a7a737',
		oceania: '#8aabb0'
	};

	const continentLabels: Record<string, string> = {
		asia: 'Asia',
		europe: 'Europe',
		africa: 'Africa',
		south_america: 'South America',
		north_america: 'North America',
		oceania: 'Oceania'
	};

	const data = $derived(flatGroup(await getCountryGdpLifeExpectancy(), (d) => d.continent));
	export { data };
</script>

<ScatterChart
	x="x"
	y="y"
	r="value"
	rRange={[3, 50]}
	xPadding={[15, 5]}
	yPadding={[5, 20]}
	series={data.map(([continent, items]) => {
		const color = continentColors[continent] ?? 'var(--color-primary)';
		return {
			key: continentLabels[continent] ?? continent,
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
				<Tooltip.Header>{data.title}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="GDP per capita" value={data.x} format="currency" />
					<Tooltip.Item label="Life expectancy" value={data.y} format="decimal" />
					<Tooltip.Item label="Population" value={data.value} format="integer" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</ScatterChart>
