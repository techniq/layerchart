<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import { AnnotationLine, AnnotationPoint, LineChart, Tooltip, Text } from 'layerchart';
	import { format } from '@layerstack/utils';


	const annotations = [
		{
			x: new Date('June 29, 2007'),
			y: 121.89,
			label: 'A',
			details: 'iPhone (1st Gen)'
		},
		{
			x: new Date('July 11, 2008'),
			y: 175.16,
			label: 'B',
			details: 'iPhone 3G'
		},
		{
			x: new Date('April 3, 2010'),
			y: 232.39,
			label: 'C',
			details: 'iPad (1st Gen)'
		},
		{
			x: new Date('June 24, 2010'),
			y: 254.28,
			label: 'D',
			details: 'iPhone 4'
		},
		{
			x: new Date('September 1, 2010'),
			y: 258.77,
			label: 'E',
			details: 'Apple TV (2nd Gen)'
		},
		{
			x: new Date('March 11, 2011'),
			y: 352.47,
			label: 'F',
			details: 'iPad (2nd Gen)'
		},
		{
			x: new Date('March 7, 2012'),
			y: 545.18,
			label: 'G',
			details: 'Apple TV (3rd Gen)'
		}
	];

	export { data };
</script>

<LineChart {data} x="date" y="value" height={300} padding={{ top: 10, bottom: 20, left: 25 }}>
	{#snippet aboveMarks({ context })}
		<Text x={context.width / 2} y={10} textAnchor="middle" value="Apple Stock" />
		{#each annotations as annotation}
			<AnnotationLine
				x={annotation.x}
				y={annotation.y}
				props={{ line: { class: '[stroke-dasharray:4,4] opacity-50' } }}
			/>

			<AnnotationPoint
				x={annotation.x}
				y={annotation.y}
				r={8}
				label={annotation.label}
				details={annotation.details}
				props={{
					circle: { class: 'fill-secondary' },
					label: { class: 'text-[10px] fill-secondary-content font-bold' }
				}}
			/>
		{/each}
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
