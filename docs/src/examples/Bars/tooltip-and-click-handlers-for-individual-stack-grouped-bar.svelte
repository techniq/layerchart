<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Bar, Bars, Axis, Chart, Highlight, Layer, Tooltip, groupStackData } from 'layerchart';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
	import { longData } from '$lib/utils/data.js';
	import { unique } from '@layerstack/utils';

	const colorKeys = [...new Set(longData.map((x) => x.fruit))];
	const keyColors = [
		'var(--color-info)',
		'var(--color-success)',
		'var(--color-warning)',
		'var(--color-danger)'
	];

	let transitionChartMode = $state('group');

	const transitionChart = $derived(
		transitionChartMode === 'group'
			? ({ groupBy: 'fruit', stackBy: undefined } as const)
			: transitionChartMode === 'stack'
				? ({ groupBy: undefined, stackBy: 'fruit' } as const)
				: ({ groupBy: 'basket', stackBy: 'fruit' } as const)
	);

	const data = $derived(
		groupStackData(longData, {
			xKey: 'year',
			groupBy: transitionChart.groupBy,
			stackBy: transitionChart.stackBy
		})
	);

	export { data };
</script>

<div class="grid grid-cols-[1fr_1fr] gap-2 mb-2">
	<Field label="Mode">
		<ToggleGroup bind:value={transitionChartMode} variant="outline" size="sm" inset class="w-full">
			<ToggleOption value="group">Grouped</ToggleOption>
			<ToggleOption value="stack">Stacked</ToggleOption>
			<ToggleOption value="groupStack">Grouped & Stacked</ToggleOption>
		</ToggleGroup>
	</Field>
</div>

<Chart
	{data}
	x="values"
	xNice
	y="year"
	yScale={scaleBand().paddingInner(0.2).paddingOuter(0.1)}
	c="fruit"
	cDomain={colorKeys}
	cRange={keyColors}
	y1={transitionChart.groupBy}
	y1Scale={transitionChart.groupBy ? scaleBand().padding(0.1) : undefined}
	y1Domain={transitionChart.groupBy
		? unique(data.map((d) => d[transitionChart.groupBy]))
		: undefined}
	y1Range={({ yScale }) => [0, yScale.bandwidth()]}
	padding={{ left: 16, bottom: 24 }}
	height={400}
>
	{#snippet children({ context })}
		<Layer>
			<Axis placement="bottom" grid rule />
			<Axis placement="left" rule />
			<g>
				{#each data as d (d.year + '-' + d.fruit)}
					<Bar
						data={d}
						strokeWidth={1}
						onclick={(e) => {
							alert('Clicked: ' + d.fruit + ' in ' + d.year);
						}}
						onpointerenter={(e) => context.tooltip.show(e, d)}
						onpointerleave={(e) => context.tooltip.hide()}
					/>
				{/each}
			</g>
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.year}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item
						label={data.fruit}
						value={data.value}
						color={context.cScale(data.fruit)}
						format="integer"
						valueAlign="right"
					/>
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
