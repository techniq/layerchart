<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import { Area, Chart, ChartGroup, Layer, LineChart, defaultChartPadding } from 'layerchart';

	export { data };
</script>

<!--
	Two views of one range, held by the group rather than by either of them.  Pan or zoom the detail
	chart, or drag a selection on the overview — each writes the same range and the other follows.
-->
<ChartGroup domain={{ axis: 'x' }}>
	{#snippet children({ group })}
		<!-- The overview's rectangle: the selection while one is being dragged, else the shared range -->
		{@const viewport = group.brush.active ? group.brush : group.domain}

		<LineChart
			{data}
			x="date"
			y="value"
			yDomain={[0, null]}
			transform={{
				mode: 'domain',
				axis: 'x',
				scaleExtent: [1, 50],
				domainExtent: { x: { min: 'data', max: 'data', minRange: 7 * 24 * 60 * 60 * 1000 } }
			}}
			clip
			padding={defaultChartPadding({ left: 25, bottom: 24 })}
			height={280}
		/>

		<Chart
			{data}
			x="date"
			y="value"
			brush={{ x: (viewport.x ?? [null, null]) as any }}
			groupOptions={{ publish: ['domain'], subscribe: ['pointer'] }}
			padding={{ left: 16 }}
			height={40}
		>
			<Layer>
				<Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
			</Layer>
		</Chart>
	{/snippet}
</ChartGroup>
