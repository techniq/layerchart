<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Area, Axis, Chart, Layer, Highlight, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import TooltipContextControls from '$lib/components/controls/TooltipContextControls.svelte';

	const data = createDateSeries({
		count: 30,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});
	export { data };

	let settings = $state({
		mode: 'quadtree-x',
		highlight: ['points', 'lines'],
		axis: undefined,
		snapToDataX: false,
		snapToDataY: false
	}) as ComponentProps<typeof TooltipContextControls>['settings'];
</script>

<TooltipContextControls bind:settings />

<Chart
	{data}
	x="date"
	y="value"
	yDomain={[0, null]}
	yNice
	padding={{ top: 5, left: 28, bottom: 24 }}
	tooltip={{
		mode: settings.mode
	}}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Area class="fill-primary/30" line={{ class: 'stroke-primary stroke-2' }} />
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
			<Tooltip.Header value={data.date} format="day" />
			<Tooltip.List>
				<Tooltip.Item label="value" value={data.value} />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
