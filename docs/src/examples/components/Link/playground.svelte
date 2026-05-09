<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Link, Chart, Circle, Layer } from 'layerchart';
	import LinkPlaygroundControls from '$lib/components/controls/LinkControls.svelte';
	import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
	import type { LinkSweep, LinkType } from '$lib/utils/linkUtils.js';

	import { movable } from '$lib/attachments/movable.js';

	let source = $state({ x: 300, y: 150 });
	let middle = $state({ x: 420, y: 240 });
	let target = $state({ x: 500, y: 300 });

	let showMiddle = $state(false);
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
	bind:showMiddle
/>

<Chart padding={{ left: 16, bottom: 24 }} height={400}>
	<Layer>
		{#if showMiddle}
			<Link
				x1={source.x}
				y1={source.y}
				x2={middle.x}
				y2={middle.y}
				{sweep}
				{type}
				{radius}
				{bend}
				{curve}
				{orientation}
				class="stroke-primary stroke-4"
			/>
			<Link
				x1={middle.x}
				y1={middle.y}
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
		{:else}
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
		{/if}
		<Circle
			cx={source.x}
			cy={source.y}
			r={10}
			class="cursor-grab fill-surface-200 stroke-4 stroke-info"
			{@attach movable({
				onMove: ({ dx, dy }) => {
					source.x += dx;
					source.y += dy;
				}
			})}
		/>

		{#if showMiddle}
			<Circle
				cx={middle.x}
				cy={middle.y}
				r={10}
				class="cursor-grab fill-primary/50"
				{@attach movable({
					onMove: ({ dx, dy }) => {
						middle.x += dx;
						middle.y += dy;
					}
				})}
			/>
		{/if}

		<Circle
			cx={target.x}
			cy={target.y}
			r={10}
			class="cursor-grab fill-surface-200 stroke-4 stroke-accent"
			{@attach movable({
				onMove: ({ dx, dy }) => {
					target.x += dx;
					target.y += dy;
				}
			})}
		/>
	</Layer>
</Chart>
