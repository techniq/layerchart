<script lang="ts">
	import type { ComponentProps } from 'svelte';

	import { Area, Axis, Chart, Layer, Highlight, Tooltip } from 'layerchart';
	import AnchorLocationControls from '$lib/components/TooltipControls2.svelte';

	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 30,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	let anchor: ComponentProps<typeof Tooltip.Root>['anchor'] = $state('top-left');
	let snap: 'pointer' | 'data' = $state('pointer');
	let contained: ComponentProps<typeof Tooltip.Root>['contained'] = $state(false);

	export { data };
</script>

<AnchorLocationControls bind:anchor bind:snap bind:contained />
<Chart
	{data}
	x="date"
	y="value"
	yDomain={[0, null]}
	yNice
	padding={{ top: 5, left: 28, bottom: 24 }}
	tooltip={{ mode: 'quadtree-x' }}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Area class="fill-primary/30" line={{ class: 'stroke-primary stroke-2' }} />
		<Highlight points lines />
	</Layer>
	<Tooltip.Root
		{anchor}
		x={snap}
		xOffset={['top', 'center', 'bottom'].includes(anchor ?? '') ? 0 : 10}
		y={snap}
		yOffset={['left', 'center', 'right'].includes(anchor ?? '') ? 0 : 10}
		{contained}
	>
		{#snippet children({ data })}
			<Tooltip.Header value={data.date} format="day" />
			<Tooltip.List>
				<Tooltip.Item label="value" value={data.value} />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
