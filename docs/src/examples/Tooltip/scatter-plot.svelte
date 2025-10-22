<script lang="ts">
	import { Axis, Chart, Layer, Highlight, Points, Tooltip } from 'layerchart';
	import { getSpiral } from '$lib/utils/data.js';
	import TooltipControls from '$lib/components/TooltipControls.svelte';
	import type { ComponentProps } from 'svelte';

	const data = getSpiral({ angle: 137.5, radius: 10, count: 100, width: 500, height: 500 });
	export { data };

	let settings = $state({
		mode: 'quadtree',
		highlight: ['points', 'lines'],
		axis: 'both',
		snapToDataX: true,
		snapToDataY: true,
		debug: false
	}) as ComponentProps<typeof TooltipControls>['settings'];
</script>

<TooltipControls bind:settings />
<Chart
	{data}
	x="x"
	y="y"
	padding={{ left: 30, bottom: 30 }}
	tooltip={{
		mode: settings.mode,
		debug: settings.debug
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
