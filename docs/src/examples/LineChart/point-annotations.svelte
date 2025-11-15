<script lang="ts">
	import { LineChart, Tooltip } from 'layerchart';
	import { format, sortFunc } from '@layerstack/utils';
	import { getAppleStock } from '$lib/data.remote';

	const data = await getAppleStock();

	export { data };

	// Get a few random points to use for annotations
	const annotations = $derived(
		[...data]
			.sort(() => Math.random() - 0.5)
			.slice(0, 5)
			.sort(sortFunc('date'))
			.map((d, i) => ({
				date: d.date,
				label: String.fromCharCode(65 + i),
				details: `This is an annotation for ${format(d.date)}`
			}))
	);
</script>

<LineChart
	{data}
	x="date"
	y="value"
	annotations={annotations.map((a) => {
		return {
			type: 'point',
			label: a.label,
			details: a.details,
			x: a.date,
			r: 6,
			props: {
				circle: { class: 'fill-secondary' },
				label: { class: 'text-[10px] fill-secondary-content font-bold' }
			}
		};
	})}
	height={300}
	padding={20}
>
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
					<Tooltip.Header>{format(context.x(data), 'day')}</Tooltip.Header>
					<Tooltip.List>
						<Tooltip.Item label="value" value={context.y(data)} />
					</Tooltip.List>
				{/if}
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</LineChart>
