<script lang="ts">
	import { AnnotationLine, AnnotationPoint, LineChart } from 'layerchart';
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

<LineChart {data} x="date" y="value" height={300} padding={{ top: 10, bottom: 20, left: 25 }}>
	{#snippet aboveMarks({ context })}
		{#each annotations as annotation}
			<AnnotationLine
				x={annotation.x}
				y={annotation.y}
				props={{ line: { class: '[stroke-dasharray:4,4] opacity-50' } }}
			/>

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
	{/snippet}
</LineChart>
