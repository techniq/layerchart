<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Axis, Bar, Chart, Layer, Tooltip, groupStackData } from 'layerchart';
	import { longData } from '$lib/utils/data.js';
	import { cubicInOut } from 'svelte/easing';
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
			? ({
					groupBy: 'fruit',
					stackBy: undefined
				} as const)
			: transitionChartMode === 'stack'
				? ({
						groupBy: undefined,
						stackBy: 'fruit'
					} as const)
				: transitionChartMode === 'groupStack'
					? ({
							groupBy: 'basket',
							stackBy: 'fruit'
						} as const)
					: ({
							groupBy: undefined,
							stackBy: undefined
						} as const)
	);

	const transitionData = $derived(
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

<Chart
	data={transitionData}
	x="year"
	xScale={scaleBand().paddingInner(0.4).paddingOuter(0.2)}
	y="values"
	yNice
	c="fruit"
	cDomain={colorKeys}
	cRange={keyColors}
	x1={transitionChart.groupBy}
	x1Scale={transitionChart.groupBy ? scaleBand().padding(0.1) : undefined}
	x1Domain={transitionChart.groupBy
		? unique(transitionData.map((d) => d[transitionChart.groupBy]))
		: undefined}
	x1Range={({ xScale }) => [0, xScale.bandwidth()]}
	padding={{ left: 16, bottom: 24 }}
>
	{#snippet children({ context })}
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />
			<g>
				{#each transitionData as d (d.year + '-' + d.fruit)}
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
							alert('You clicked on: ' + JSON.stringify(d, null, 2));
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
