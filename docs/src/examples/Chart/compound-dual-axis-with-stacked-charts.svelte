<script lang="ts">
	import { Axis, Chart, Highlight, Layer, Spline, Tooltip } from 'layerchart';
	import { getNewPassengerCars } from '$lib/data.remote.js';

	const data = await getNewPassengerCars();

	export { data };
</script>

<div class="grid grid-stack p-6">
	<!-- Sales chart-->
	<Chart {data} x="year" y="sales" yDomain={[0, null]} yNice height={300}>
		<Layer>
			<Axis
				placement="left"
				rule
				format="metric"
				label="↑ sales (M)"
				labelPlacement="start"
				labelProps={{ class: 'fill-primary' }}
			/>
			<Axis placement="bottom" format="none" rule />
			<Spline class="stroke-2 stroke-primary" />
			<Highlight lines points />
		</Layer>
	</Chart>

	<!-- Efficiency chart, provides tooltip for both values  -->
	<Chart {data} x="year" y="efficiency" tooltip={{ mode: 'quadtree-x' }}>
		<Layer>
			<Axis
				placement="right"
				rule
				label="efficiency (mpg) ↑"
				labelPlacement="start"
				labelProps={{ class: 'fill-secondary' }}
			/>
			<Spline class="stroke-2 stroke-secondary" />
			<!-- Difficult to add points for both charts without using a remaped scale for one value -->
			<Highlight lines />
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.year}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="sales" value={data.sales} format="currencyRound" />
					<Tooltip.Item label="efficiency" value={data.efficiency} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	</Chart>
</div>
