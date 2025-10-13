<script lang="ts">
	import { AreaChart, Tooltip } from 'layerchart';
	import { format, parse, sortFunc } from '@layerstack/utils';
	import type { AppleStockData } from '$static/data/examples/date/apple-stock.js';

	const data = await fetch('/data/examples/date/apple-stock.json').then(async (r) =>
		parse<AppleStockData>(await r.text())
	);
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

<AreaChart
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
</AreaChart>
