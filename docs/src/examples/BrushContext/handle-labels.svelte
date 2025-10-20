<script lang="ts">
	import { Area, Chart, Layer, Text } from 'layerchart';
	import { format } from '@layerstack/utils';
	import { getAppleStock } from '$lib/data.remote';

	const data = $derived(await getAppleStock());

	export { data };
</script>

<Chart {data} x="date" y="value" brush height={40}>
	{#snippet children({ context })}
		<Layer>
			<Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
			{#if context.brush.isActive}
				<Text
					x={context.brush.range.x - 4}
					y={context.brush.range.height / 2}
					value={format(context.brush.xDomain?.[0] as any)}
					textAnchor="end"
					verticalAnchor="middle"
					class="text-xs"
				/>
				<Text
					x={context.brush.range.x + context.brush.range.width + 4}
					y={context.brush.range.height / 2}
					value={format(context.brush.xDomain?.[1] as any)}
					verticalAnchor="middle"
					class="text-xs"
				/>
			{/if}
		</Layer>
	{/snippet}
</Chart>
