<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Link, Chart, Circle, Layer } from 'layerchart';
	import LinkPlaygroundControls from '$lib/components/controls/LinkControls.svelte';
	import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
	import type { LinkSweep, LinkType } from '$lib/utils/linkUtils.js';

	import { movable } from '$lib/attachments/movable.js';

	let source = $state({ x: 300, y: 150 });
	let target = $state({ x: 500, y: 300 });

	let type: LinkType = $state('d3');
	let curve: ComponentProps<typeof CurveMenuField>['value'] = $state(undefined);
	let sweep: LinkSweep = $state('horizontal-vertical');
	let orientation: 'horizontal' | 'vertical' = $state('horizontal');
	let radius = $state(60);
	let bend = $state(22.5);
</script>

<LinkPlaygroundControls
	bind:type
	bind:curve
	bind:sweep
	bind:orientation
	bind:radius
	bind:bend
/>

<Chart padding={{ left: 16, bottom: 24 }} height={400}>
	<Layer>
		<Link
			x1={source.x}
			y1={source.y}
			x2={target.x}
			y2={target.y}
			{sweep}
			{type}
			{radius}
			{bend}
			{curve}
			{orientation}
			class="stroke-primary stroke-4"
		/>
		<Circle
			cx={source.x}
			cy={source.y}
			r={10}
			class="cursor-grab fill-info stroke-2 stroke-info"
			{@attach movable({
				onMove: ({ dx, dy }) => {
					source.x += dx;
					source.y += dy;
				}
			})}
		/>

		<Circle
			cx={target.x}
			cy={target.y}
			r={10}
			class="cursor-grab fill-accent stroke-2 stroke-accent"
			{@attach movable({
				onMove: ({ dx, dy }) => {
					target.x += dx;
					target.y += dy;
				}
			})}
		/>
	</Layer>
</Chart>
