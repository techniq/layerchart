<script lang="ts">
	import { Area, Chart, Layer, Text } from 'layerchart';
	import { format } from '@layerstack/utils';
	import { getAppleStock } from '$lib/data.remote';

	const data = await getAppleStock();
	export { data };
</script>

<Chart {data} x="date" y="value" padding={{ left: 80, right: 80 }} brush height={40}>
	{#snippet children({ context })}
		<Layer>
			<Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />

			{#if context.brush.isActive}
				<Text
					x={-4}
					y={context.height / 2}
					value={format(context.brush.xDomain?.[0] as any)}
					textAnchor="end"
					verticalAnchor="middle"
					class="text-xs"
				/>
				<Text
					x={context.width + 4}
					y={context.height / 2}
					value={format(context.brush.xDomain?.[1] as any)}
					verticalAnchor="middle"
					class="text-xs"
				/>
			{/if}
		</Layer>
	{/snippet}
</Chart>
