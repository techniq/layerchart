<script lang="ts">
	import { scaleLinear } from 'd3-scale';
	import { Axis, Chart, Highlight, Layer, Spline, Tooltip } from 'layerchart';
	import { getNewPassengerCars } from '$lib/data.remote.js';

	const data = await getNewPassengerCars();

	export { data };
</script>

<!-- Remap efficiency to its equivalent value in sales - https://observablehq.com/@observablehq/plot-dual-axis -->
<Chart
	{data}
	x="year"
	y="sales"
	yDomain={[0, null]}
	yNice
	y1="efficiency"
	y1Range={({ yScale }) => yScale.domain()}
	tooltip={{ mode: 'quadtree-x' }}
	padding={30}
	height={300}
>
	{#snippet children({ context })}
		<Layer>
			<Axis
				placement="left"
				rule
				format="metric"
				label="↑ sales (M)"
				labelPlacement="start"
				labelProps={{ class: 'fill-primary' }}
			/>
			<Axis
				placement="right"
				scale={scaleLinear(context.y1Scale?.domain() ?? [], [context.height, 0])}
				ticks={context.y1Scale?.ticks?.()}
				rule
				label="efficiency (mpg) ↑"
				labelPlacement="start"
				labelProps={{ class: 'fill-secondary' }}
			/>
			<Axis placement="bottom" format="none" rule />
			<Spline class="stroke-2 stroke-primary" />
			<Spline y={(d) => context.y1Scale?.(d.efficiency)} class="stroke-2 stroke-secondary" />
			<Highlight lines points />
			<Highlight points={{ class: 'fill-secondary' }} y={(d) => context.y1Scale?.(d.efficiency)} />
		</Layer>

		<Tooltip.Root {context}>
			{#snippet children({ data })}
				<Tooltip.Header>{data.year}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="sales" value={data.sales} format="currencyRound" />
					<Tooltip.Item label="efficiency" value={data.efficiency} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
