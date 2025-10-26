<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Bar, Axis, Chart, Layer, Tooltip, groupStackData } from 'layerchart';
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
						class="cursor-pointer"
						onclick={(e) => {
							alert('You clicked on:\n' + JSON.stringify(d, null, 2));
						}}
						onpointerenter={(e) => context.tooltip.show(e, d)}
						onpointermove={(e) => context.tooltip.show(e, d)}
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
						color={context.cScale?.(data.fruit)}
						format="integer"
						valueAlign="right"
					/>
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
