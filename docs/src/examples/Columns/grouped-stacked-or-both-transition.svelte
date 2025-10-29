<script lang="ts">
	import { longData } from '$lib/utils/data';
	import { unique } from '@layerstack/utils';
	import { sum } from 'd3-array';
	import { scaleBand } from 'd3-scale';
	import { Axis, Bar, Chart, groupStackData, Highlight, Layer, Tooltip } from 'layerchart';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
	import { cubicInOut } from 'svelte/easing';

	const colorKeys = [...new Set(longData.map((x) => x.fruit))];
	const keyColors = [
		'var(--color-info)',
		'var(--color-success)',
		'var(--color-warning)',
		'var(--color-danger)'
	];

	let chartMode = $state('group');

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
	tooltip={{ mode: 'band' }}
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
