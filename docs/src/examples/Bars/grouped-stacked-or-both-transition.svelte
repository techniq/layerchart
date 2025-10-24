<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { sum } from 'd3-array';
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
	tooltip={{ mode: 'band' }}
	height={400}
>
	{#snippet children({ context })}
		<Layer>
			<Axis placement="bottom" grid rule />
			<Axis placement="left" rule />
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
							color={context.cScale(d.fruit)}
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
