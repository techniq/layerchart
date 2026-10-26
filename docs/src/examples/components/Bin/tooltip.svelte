<script module lang="ts">
	import { getOlympians } from '$lib/data.remote.js';
	const olympians = await getOlympians();
</script>

<script lang="ts">
	import { mean } from 'd3-array';
	import { Axis, Bin, type BinCell, Chart, Layer, Tooltip } from 'layerchart';

	const data = olympians.filter((d) => d.weight != null && d.height != null);
	export { data };

	type Athlete = (typeof data)[number];
</script>

<Chart
	{data}
	x="weight"
	y="height"
	xNice
	yNice
	xPadding={[24, 24]}
	yPadding={[24, 24]}
	padding={{ left: 30, bottom: 24, top: 8, right: 8 }}
	height={400}
>
	{#snippet children({ context })}
		<Layer>
			<Bin
				size={24}
				class="hover:stroke-surface-content"
				onpointermove={(e, cell) => context.tooltip.show(e, cell)}
				onpointerleave={() => context.tooltip.hide()}
			/>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				<!-- Shown with the cell under the pointer, rather than a row -->
				{@const cell = data as BinCell<Athlete>}
				<Tooltip.List>
					<Tooltip.Item label="Athletes" value={cell.count} />
					<Tooltip.Item
						label="Medals"
						value={cell.data.reduce((sum, d) => sum + d.gold + d.silver + d.bronze, 0)}
					/>
					<Tooltip.Item
						label="Mean weight"
						value={mean(cell.data, (d) => d.weight)}
						format="decimal"
					/>
					<Tooltip.Item
						label="Mean height"
						value={mean(cell.data, (d) => d.height)}
						format="decimal"
					/>
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
