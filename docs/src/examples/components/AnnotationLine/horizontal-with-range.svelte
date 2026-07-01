<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import { AnnotationLine, AnnotationRange, LineChart } from 'layerchart';

	export { data };
</script>

<LineChart {data} x="date" y="value" height={300} padding={{ top: 10, bottom: 20, left: 25 }}>
	{#snippet aboveMarks({ context })}
		<AnnotationRange
			y={[500, null]}
			pattern={{
				size: 8,
				lines: {
					rotate: -45,
					opacity: 0.2
				}
			}}
		/>

		<AnnotationLine
			y={500}
			label="Max"
			labelPlacement="bottom-right"
			labelYOffset={2}
			props={{
				line: { dashArray: [2, 2] }
			}}
		/>
	{/snippet}
</LineChart>
