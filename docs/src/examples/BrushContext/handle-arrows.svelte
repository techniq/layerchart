<script lang="ts">
	import { Area, Chart, Layer } from 'layerchart';
	import { cls } from '@layerstack/tailwind';
	import LucideChevronLeft from '~icons/lucide/chevron-left';
	import LucideChevronRight from '~icons/lucide/chevron-right';
	import { getAppleStock } from '$lib/data.remote';

	const data = await getAppleStock();

	export { data };
</script>

<Chart
	{data}
	x="date"
	y="value"
	brush={{ classes: { range: 'bg-secondary/10' }, handleSize: 8 }}
	height={40}
>
	{#snippet children({ context })}
		<Layer>
			<Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />

			{#if context.brush.isActive}
				<rect
					x={context.brush.range.x}
					width={context.brush.handleSize}
					height={context.brush.range.height}
					class={cls('fill-secondary cursor-ew-resize select-none')}
				/>
				<LucideChevronLeft
					x={context.brush.range.x - 6}
					y={context.brush.range.height / 2 - 10}
					class="fill-secondary-content"
				/>

				<rect
					x={context.brush.range.x + context.brush.range.width - context.brush.handleSize}
					width={context.brush.handleSize}
					height={context.brush.range.height}
					class={cls('fill-secondary cursor-ew-resize select-none')}
				/>
				<LucideChevronRight
					x={context.brush.range.x + context.brush.range.width - context.brush.handleSize - 6}
					y={context.brush.range.height / 2 - 10}
					class="fill-secondary-content"
				/>
			{/if}
		</Layer>
	{/snippet}
</Chart>
