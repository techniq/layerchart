<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import { AnnotationRange, Layer, LineChart, defaultChartPadding } from 'layerchart';

	export { data };
</script>

<LineChart
	{data}
	x="date"
	y="value"
	height={300}
	padding={defaultChartPadding({ left: 25, bottom: 15 })}
>
	{#snippet belowContext()}
		<Layer type="html" class="pointer-events-none">
			<AnnotationRange
				x={[new Date('2010-01-01'), new Date('2010-12-31')]}
				class="bg-primary/10"
				labelPlacement="top"
				labelYOffset={8}
			>
				{#snippet label({ props })}
					<div
						class="absolute -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-content shadow"
						style:left="{props.x}px"
						style:top="{props.y}px"
					>
						Fiscal 2010
					</div>
				{/snippet}
			</AnnotationRange>
		</Layer>
	{/snippet}
</LineChart>
