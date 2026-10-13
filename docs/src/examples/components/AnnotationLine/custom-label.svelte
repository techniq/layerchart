<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import { AnnotationLine, Layer, LineChart } from 'layerchart';

	export { data };
</script>

<LineChart {data} x="date" y="value" height={300} padding={{ top: 10, bottom: 20, left: 25 }}>
	{#snippet aboveContext()}
		<Layer type="html" class="pointer-events-none">
			<AnnotationLine
				y={500}
				props={{ line: { dashArray: [2, 2], stroke: 'var(--color-danger)' } }}
			>
				{#snippet label({ props })}
					<div
						class="absolute -translate-x-full -translate-y-1/2 whitespace-nowrap rounded-full bg-danger px-2 py-0.5 text-xs font-medium text-danger-content shadow"
						style:left="{props.x}px"
						style:top="{props.y}px"
					>
						Max · $500
					</div>
				{/snippet}
			</AnnotationLine>
		</Layer>
	{/snippet}
</LineChart>
