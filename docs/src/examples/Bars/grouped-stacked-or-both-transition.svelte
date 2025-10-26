<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { sum } from 'd3-array';
	import { Bar, Axis, Chart, Highlight, Layer, Tooltip, groupStackData } from 'layerchart';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
	import { longData } from '$lib/utils/data.js';
	import { unique } from '@layerstack/utils';
	import { cubicInOut } from 'svelte/easing';

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
		}) as {
			year: string;
			fruit: string;
			basket: number;
			keys: string[];
			value: number;
			values: number[];
		}[]
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

<!-- Always use stackedData for extents for consistent scale -->
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
			<g>
				<!-- TODO: 'data' can be used once type issue is resolved -->
				{#each data as d (d.year + '-' + d.fruit)}
					<Bar
						data={d}
						fill={context.cScale?.(d.fruit)}
						strokeWidth={1}
						motion={{
							x: {
								type: 'tween',
								easing: cubicInOut,
								delay: transitionChart.groupBy ? 0 : 300
							},
							y: {
								type: 'tween',
								easing: cubicInOut,
								delay: transitionChart.groupBy ? 300 : 0
							},
							width: {
								type: 'tween',
								easing: cubicInOut,
								delay: transitionChart.groupBy ? 0 : 300
							},
							height: {
								type: 'tween',
								easing: cubicInOut,
								delay: transitionChart.groupBy ? 300 : 0
							}
						}}
					/>
				{/each}
			</g>
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

					<!-- TODO: Remove [...] type hack to make svelte-check happy -->
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
