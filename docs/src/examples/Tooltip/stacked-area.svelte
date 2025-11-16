<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { stack } from 'd3-shape';
	import { Area, asAny, Axis, Chart, Layer, Highlight, Tooltip } from 'layerchart';
	import { flatten } from '@layerstack/utils';
	import { createDateSeries } from '$lib/utils/data.js';
	import TooltipControls from '$lib/components/TooltipControls.svelte';

	const keys = ['apples', 'bananas', 'oranges'];
	const stackDateSeries = createDateSeries({
		count: 30,
		min: 50,
		max: 100,
		value: 'integer',
		keys
	});
	const data = stack().keys(keys)(stackDateSeries) as any[];

	let settings = $state({
		mode: 'quadtree-x',
		highlight: ['points', 'lines'],
		axis: undefined,
		snapToDataX: false,
		snapToDataY: false
	}) as ComponentProps<typeof TooltipControls>['settings'];

	export { data };
</script>

<TooltipControls bind:settings />
<Chart
	{data}
	flatData={flatten(data)}
	x={(d) => asAny(d).data.date}
	y={[0, 1]}
	yNice
	c="key"
	cDomain={keys}
	cRange={['var(--color-info)', 'var(--color-success)', 'var(--color-warning)']}
	padding={{ top: 5, left: 28, bottom: 24 }}
	tooltip={{
		mode: settings.mode
	}}
	height={300}
>
	{#snippet children({ context })}
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />

			{#each data as seriesData}
				{@const color = context.cGet(seriesData)}
				<Area
					data={seriesData}
					line={{ stroke: color, 'stroke-width': 2 }}
					fill={color}
					fillOpacity={0.2}
				/>
			{/each}

			<Highlight
				points={settings.highlight.includes('points')}
				lines={settings.highlight.includes('lines')}
				area={settings.highlight.includes('area')}
				axis={settings.axis}
			/>
		</Layer>
		<Tooltip.Root
			x={settings.snapToDataX ? 'data' : 'pointer'}
			y={settings.snapToDataY ? 'data' : 'pointer'}
		>
			{#snippet children({ data })}
				<Tooltip.Header value={data.data.date} format="day" />
				<Tooltip.List>
					{#each keys as key}
						<Tooltip.Item label={key} value={data.data[key]} />
					{/each}
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
