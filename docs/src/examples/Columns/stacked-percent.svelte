<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Axis, Bars, Chart, Highlight, Layer, Tooltip, groupStackData } from 'layerchart';
	import { sum } from 'd3-array';
	import { longData } from '$lib/utils/data';
	import { stackOffsetExpand } from 'd3-shape';

	const colorKeys = [...new Set(longData.map((x) => x.fruit))];
	const keyColors = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-accent)'];

	const stackedPercentData = groupStackData(longData, {
		xKey: 'year',
		stackBy: 'fruit',
		offset: stackOffsetExpand
	});

	export { data };
</script>

<Chart
	data={stackedPercentData}
	x="year"
	xScale={scaleBand().paddingInner(0.4).paddingOuter(0.2)}
	y="values"
	yNice
	c="fruit"
	cDomain={colorKeys}
	cRange={keyColors}
	padding={{ left: 16, bottom: 24 }}
	tooltip={{ mode: 'band' }}
>
	{#snippet children({ context })}
		<Layer>
			<Axis placement="left" grid rule format="percentRound" />
			<Axis placement="bottom" rule />
			<Bars strokeWidth={1} />
			<Highlight area />
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.year}</Tooltip.Header>
				<Tooltip.List>
					{#each data.data as d}
						<Tooltip.Item
							label={d.fruit}
							value={d.value}
							color={context.cScale?.(d.fruit)}
							format="integer"
							valueAlign="right"
						/>
					{/each}

					<Tooltip.Separator />

					<Tooltip.Item
						label="total"
						value={sum([...data.data], (d) => d.value)}
						format="integer"
						valueAlign="right"
					/>
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
