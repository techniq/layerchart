<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Axis, Bar, Chart, Layer, Tooltip, groupStackData } from 'layerchart';
	import { longData } from '$lib/utils/data.js';
	import { cubicInOut } from 'svelte/easing';
	import { unique } from '@layerstack/utils';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

	const colorKeys = [...new Set(longData.map((x) => x.fruit))];
	const keyColors = [
		'var(--color-info)',
		'var(--color-success)',
		'var(--color-warning)',
		'var(--color-danger)'
	];

	let chartMode = $state('group');

	const groupBy = $derived(
		chartMode === 'group' ? 'fruit' : chartMode === 'groupStack' ? 'basket' : undefined
	);
	const stackBy = $derived(
		chartMode === 'stack' || chartMode === 'groupStack' ? 'fruit' : undefined
	);

	const data = $derived(
		groupStackData(longData, {
			xKey: 'year',
			groupBy,
			stackBy
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

<Field label="Mode" class="mb-4">
	<ToggleGroup bind:value={chartMode} variant="outline" size="sm" inset class="w-full">
		<ToggleOption value="group">Grouped</ToggleOption>
		<ToggleOption value="stack">Stacked</ToggleOption>
		<ToggleOption value="groupStack">Grouped & Stacked</ToggleOption>
	</ToggleGroup>
</Field>

<Chart
	{data}
	x="year"
	xScale={scaleBand().paddingInner(0.4).paddingOuter(0.2)}
	y="values"
	yNice
	c="fruit"
	cDomain={colorKeys}
	cRange={keyColors}
	x1={groupBy}
	x1Scale={groupBy ? scaleBand().padding(0.1) : undefined}
	x1Domain={groupBy ? unique(data.map((d) => d[groupBy])) : undefined}
	x1Range={({ xScale }) => [0, xScale.bandwidth()]}
	padding={{ left: 32, bottom: 20, top: 8 }}
	height={300}
>
	{#snippet children({ context })}
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />
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
