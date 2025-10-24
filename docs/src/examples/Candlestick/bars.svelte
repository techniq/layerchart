<script lang="ts">
	import { scaleUtc } from 'd3-scale';
	import { utcDay } from 'd3-time';
	import { Axis, Bars, Chart, Highlight, Layer, Rule, Tooltip, type DomainType } from 'layerchart';
	import { getAppleTicker } from '$lib/data.remote.js';

	const data = $derived(await getAppleTicker());

	export { data };
</script>

<Chart
	{data}
	x="date"
	xScale={scaleUtc()}
	xInterval={utcDay}
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
		<Bars y={['high', 'low']} insets={{ x: 1.5 }} class="fill-surface-content" />
		<Bars y={['open', 'close']} insets={{ x: 0.5 }} />
		<Highlight area />
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
