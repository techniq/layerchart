<script lang="ts">
	import { Area, Chart, Layer, Text } from 'layerchart';
	import { format } from '@layerstack/utils';
	import { asAny } from '$lib/utils/types.js';
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
					value={format(asAny(context.brush.xDomain?.[0]))}
					textAnchor="end"
					verticalAnchor="middle"
					class="text-xs"
				/>
				<Text
					x={context.brush.range.x + context.brush.range.width + 4}
					y={context.brush.range.height / 2}
					value={format(asAny(context.brush.xDomain?.[1]))}
					verticalAnchor="middle"
					class="text-xs"
				/>
			{/if}
		</Layer>
	{/snippet}
</Chart>
