<script lang="ts">
	import { scaleTime } from 'd3-scale';
	import { extent } from 'd3-array';
	import { Axis, BarChart, Tooltip } from 'layerchart';
	import { getHydro } from '$lib/data.remote.js';

	const data = await getHydro();
	export { data };
</script>

<div class="grid grid-stack p-4 border rounded-sm">
	<!-- First chart with inverted yRange (top down) -->
	<BarChart
		{data}
		x="date"
		y="rain"
		axis={{ placement: 'right', tickMarks: false }}
		yDomain={[0, 500]}
		yRange={({ height }) => [0, height]}
		padding={{ left: 32, right: 32, bottom: 20 }}
		props={{
			bars: {
				rounded: 'none',
				class: '_stroke-none fill-blue-500'
			}
		}}
		height={300}
	/>

	<BarChart
		{data}
		x="date"
		yDomain={[0, 1000]}
		padding={{ left: 32, right: 32, bottom: 20 }}
		series={[
			{
				key: 'infiltration',
				// TODO: Not sure what to be done with negative values
				// value: (d) => Math.abs(d.infiltration),
				value: (d) => (d.infiltration > 0 ? d.infiltration : 0),
				color: 'hsl(25, 95%, 53%)',
				props: {
					rounded: 'none'
				}
			},
			{
				key: 'dirtyh2o',
				color: 'hsl(0, 84%, 60%)',
				props: {
					rounded: 'none'
				}
			},
			{
				key: 'rain_induced',
				color: 'hsl(142, 71%, 45%)',
				props: {
					rounded: 'none'
				}
			}
		]}
		seriesLayout="stack"
		height={300}
	>
		{#snippet axis({ context })}
			<Axis placement="left" />
			<!-- Provide better axis than band scale currently does with time data-->
			<Axis
				placement="bottom"
				scale={scaleTime(
					// @ts-expect-error
					extent(data, (d) => d.date),
					[0, context.width]
				)}
				tickMultiline
				rule
			/>
		{/snippet}

		{#snippet tooltip({ context })}
			<Tooltip.Root {context}>
				{#snippet children({ data })}
					<Tooltip.Header value={data.date} format="day" />
					<Tooltip.List>
						<Tooltip.Item label="rain" color="hsl(200 100% 50%)" value={data.rain} />
						<Tooltip.Item
							label="infiltration"
							color="hsl(25, 95%, 53%)"
							value={data.infiltration}
						/>
						<Tooltip.Item label="dirtyh2o" color="hsl(0, 84%, 60%)" value={data.dirtyh2o} />
						<Tooltip.Item
							label="rain_induced"
							color="hsl(142, 71%, 45%)"
							value={data.rain_induced}
						/>
					</Tooltip.List>
				{/snippet}
			</Tooltip.Root>
		{/snippet}
	</BarChart>
</div>
