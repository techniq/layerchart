<script lang="ts">
	import type { ComponentProps } from 'svelte';

	import { Axis, Chart, Layer, Highlight, Points, Tooltip } from 'layerchart';
	import TooltipControls from '$lib/components/TooltipControls.svelte';

	import { getSpiral } from '$lib/utils/data.js';

	const data = getSpiral({ angle: 137.5, radius: 10, count: 100, width: 500, height: 500 });

	let settings = $state({
		mode: 'quadtree',
		highlight: ['points', 'lines'],
		axis: 'both',
		snapToDataX: true,
		snapToDataY: true
	}) as ComponentProps<typeof TooltipControls>['settings'];

	export { data };
</script>

<TooltipControls bind:settings />
<Chart
	{data}
	x="x"
	y="y"
	padding={{ left: 30, bottom: 30 }}
	tooltip={{
		mode: settings.mode
	}}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" grid rule />
		<Points class="fill-primary stroke-primary" />
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
			<Tooltip.List>
				<Tooltip.Item label="x" value={data.x} format="decimal" />
				<Tooltip.Item label="y" value={data.y} format="decimal" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
