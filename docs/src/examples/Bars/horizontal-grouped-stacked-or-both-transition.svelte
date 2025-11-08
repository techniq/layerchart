<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { sum } from 'd3-array';
	import { Bar, Axis, Chart, Highlight, Layer, Tooltip, groupStackData } from 'layerchart';
	import GroupedStackedComboControls from '$lib/components/GroupedStackedCombo.svelte';
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

	let chartMode = $state<'group' | 'stack' | 'groupStack'>('group');

	const groupBy = $derived(
		chartMode === 'group' || chartMode === 'groupStack' ? 'fruit' : undefined
	);
	const stackBy = $derived(
		chartMode === 'stack' || chartMode === 'groupStack' ? 'fruit' : undefined
	);

	const data = $derived(
		groupStackData(longData, {
			xKey: 'year',
			groupBy: groupBy,
			stackBy: stackBy
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

<GroupedStackedComboControls bind:chartMode />
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
	y1={groupBy}
	y1Scale={groupBy ? scaleBand().padding(0.1) : undefined}
	y1Domain={groupBy ? unique(data.map((d) => d[groupBy])) : undefined}
	y1Range={({ yScale }) => [0, yScale.bandwidth()]}
	padding={{ left: 32, bottom: 20, right: 8 }}
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
								delay: groupBy ? 0 : 300
							},
							y: {
								type: 'tween',
								easing: cubicInOut,
								delay: groupBy ? 300 : 0
							},
							width: {
								type: 'tween',
								easing: cubicInOut,
								delay: groupBy ? 0 : 300
							},
							height: {
								type: 'tween',
								easing: cubicInOut,
								delay: groupBy ? 300 : 0
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
