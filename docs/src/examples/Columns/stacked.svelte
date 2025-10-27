<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { sum } from 'd3-array';
	import { Axis, Bar, Bars, Chart, Highlight, Layer, Tooltip, groupStackData } from 'layerchart';
	import { longData } from '$lib/utils/data.js';

	const colorKeys = [...new Set(longData.map((x) => x.fruit))];
	const keyColors = [
		'var(--color-info)',
		'var(--color-success)',
		'var(--color-warning)',
		'var(--color-danger)'
	];

	const data = groupStackData(longData, { xKey: 'year', stackBy: 'fruit' });

	export { data };
</script>

<Chart
	{data}
	x="year"
	xScale={scaleBand().paddingInner(0.4).paddingOuter(0.2)}
	y="values"
	yNice
	c="fruit"
	cDomain={colorKeys}
	cRange={keyColors}
	padding={{ left: 16, bottom: 24 }}
	tooltip={{ mode: 'band' }}
	height={300}
>
	{#snippet children({ context })}
		<Layer>
			<Axis placement="left" grid rule />
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
