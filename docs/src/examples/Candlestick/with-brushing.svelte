<script lang="ts">
	import { scaleUtc } from 'd3-scale';
	import { utcDay } from 'd3-time';
	import { Axis, Bars, Chart, Highlight, Layer, Rule, Tooltip, type DomainType } from 'layerchart';
	import { getAppleTicker } from '$lib/data.remote.js';

	const data = await getAppleTicker();
	let xDomain = $state<DomainType>([null, null]);

	export { data };
</script>

<Chart
	data={data.filter(
		(d) =>
			(xDomain?.[0] == null || d.date >= xDomain?.[0]) &&
			(xDomain?.[1] == null || d.date <= xDomain?.[1])
	)}
	x="date"
	xScale={scaleUtc()}
	{xDomain}
	y={['high', 'low']}
	yNice
	c={(d) => (d.close < d.open ? 'desc' : 'asc')}
	cDomain={['desc', 'asc']}
	cRange={['var(--color-danger)', 'var(--color-success)']}
	padding={{ left: 20, bottom: 32 }}
	tooltip={{ mode: 'quadtree-x' }}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule tickSpacing={20} />
		<Axis placement="bottom" rule tickMultiline />
		<Rule y={['high', 'low']} />
		<Rule y={['open', 'close']} strokeWidth={3} />
		<Highlight lines />
	</Layer>

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header value={data.date} format="day" />
			<Tooltip.List>
				<Tooltip.Item label="Open" value={data.open} format="decimal" />
				<Tooltip.Item label="Close" value={data.close} format="decimal" />
				<Tooltip.Item label="High" value={data.high} format="decimal" />
				<Tooltip.Item label="Low" value={data.low} format="decimal" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>

<Chart
	{data}
	x="date"
	xScale={scaleUtc()}
	xInterval={utcDay}
	y="volume"
	yNice
	height={40}
	brush={{
		onChange: (e) => {
			xDomain = e.xDomain;
		}
	}}
>
	<Layer>
		<Bars insets={{ x: 0.5 }} />
	</Layer>
</Chart>
