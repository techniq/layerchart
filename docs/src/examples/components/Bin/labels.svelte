<script module lang="ts">
	import { getPenguins } from '$lib/data.remote.js';
	const penguins = await getPenguins();
</script>

<script lang="ts">
	import { Axis, Bin, Chart, Layer, Text } from 'layerchart';

	const data = penguins.filter((d) => d.bill_length_mm != null && d.bill_depth_mm != null);
	export { data };
</script>

<Chart
	{data}
	x="bill_length_mm"
	y="bill_depth_mm"
	xNice
	yNice
	xPadding={[36, 36]}
	yPadding={[36, 36]}
	padding={{ left: 30, bottom: 24, top: 8, right: 8 }}
	height={400}
>
	<Layer>
		<Bin size={36} fillOpacity={0.8} />
		<!-- `children` draws the same cells however you like -->
		<Bin size={36}>
			{#snippet children({ cells })}
				{#each cells as cell}
					<Text
						x={cell.x}
						y={cell.y}
						value={cell.count}
						textAnchor="middle"
						verticalAnchor="middle"
						class="text-xs fill-surface-content stroke-surface-100 [paint-order:stroke]"
						strokeWidth={2}
					/>
				{/each}
			{/snippet}
		</Bin>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
	</Layer>
</Chart>
