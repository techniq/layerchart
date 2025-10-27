<script lang="ts">
	import { AnnotationPoint, Layer, LineChart, Tooltip } from 'layerchart';
	import { format, sortFunc } from '@layerstack/utils';
	import { getAppleStock } from '$lib/data.remote';

	const data = await getAppleStock();

	// Get a few random points to use for annotations
	const annotations = $derived(
		[...data]
			.sort(() => Math.random() - 0.5)
			.slice(0, 5)
			.sort(sortFunc('date'))
			.map((d, i) => ({
				x: d.date,
				y: d.value,
				label: String.fromCharCode(65 + i),
				details: `This is an annotation for ${format(d.date)}`
			}))
	);

	export { data };
</script>

<LineChart {data} x="date" y="value" height={300}>
	{#snippet aboveContext({ context })}
		<Layer>
			{#each annotations as annotation}
				<AnnotationPoint
					x={annotation.x}
					y={annotation.y}
					r={6}
					label={annotation.label}
					details={annotation.details}
					props={{
						circle: { class: 'fill-secondary' },
						label: { class: 'text-[10px] fill-secondary-content font-bold' }
					}}
				/>
			{/each}
		</Layer>
	{/snippet}

	{#snippet tooltip({ context })}
		<Tooltip.Root>
			{#snippet children({ data })}
				{#if data.annotation}
					<!-- Annotation -->
					<div class="whitespace-nowrap">
						{data.annotation.details}
					</div>
				{:else}
					<!-- Normal tooltip -->
					<Tooltip.Header>{format(context.x(data), 'daytime')}</Tooltip.Header>
					<Tooltip.List>
						<Tooltip.Item label="value" value={context.y(data)} />
					</Tooltip.List>
				{/if}
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</LineChart>
