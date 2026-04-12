<script module>
	export const layers = ['svg', 'canvas'];
</script>

<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import { AnnotationLine, LineChart } from 'layerchart';


	export { data };
</script>

<LineChart {data} x="date" y="value" height={300} padding={{ top: 10, bottom: 20, left: 25 }}>
	{#snippet aboveMarks({ context })}
		<AnnotationLine
			y={500}
			label="Max"
			props={{
				line: { class: '[stroke-dasharray:2,2] stroke-danger' },
				label: { class: 'fill-danger' }
			}}
		/>
	{/snippet}
</LineChart>
