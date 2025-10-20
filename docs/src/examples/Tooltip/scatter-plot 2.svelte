<script lang="ts">
	import { Axis, Chart, Layer, Highlight, Points, Tooltip } from 'layerchart';
	import { getSpiral } from '$lib/utils/genData.js';
	import TooltipControls from '$lib/components/TooltipControls.svelte';
	import type { ComponentProps } from 'svelte';

	const data = getSpiral({ angle: 137.5, radius: 10, count: 100, width: 500, height: 500 });
	let charts = $state({
		scatter: {
			mode: 'quadtree',
			highlight: ['points', 'lines'],
			axis: 'both',
			snapToDataX: true,
			snapToDataY: true,
			debug: false
		}
	}) as Record<string, ComponentProps<typeof TooltipControls>['settings']>;

	export { data };
</script>

<TooltipControls bind:settings={charts.scatter} />
<Chart
	{data}
	x="x"
	y="y"
	padding={{ left: 30, bottom: 30 }}
	tooltip={{
		mode: 'quadtree',
		debug: false
	}}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" grid rule />
		<Points class="fill-primary stroke-primary" />
		<Highlight points={true} lines={true} area={false} axis="both" />
	</Layer>
	<Tooltip.Root x="data" y="data">
		{#snippet children({ data })}
			<Tooltip.List>
				<Tooltip.Item label="x" value={data.x} format="decimal" />
				<Tooltip.Item label="y" value={data.y} format="decimal" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
