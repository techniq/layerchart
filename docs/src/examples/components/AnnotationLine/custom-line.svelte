<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import { AnnotationLine, Line, LineChart } from 'layerchart';

	export { data };
</script>

<LineChart {data} x="date" y="value" height={300} padding={{ top: 10, bottom: 20, left: 25 }}>
	{#snippet aboveMarks()}
		<AnnotationLine y={400} label="Target" props={{ label: { fill: 'var(--color-danger)' } }}>
			{#snippet line({ props })}
				<!-- Halo keeps the rule legible where it crosses the series -->
				<Line {...props} stroke="var(--color-surface-100)" strokeWidth={6} />
				<Line {...props} stroke="var(--color-danger)" strokeWidth={2} dashArray={[6, 4]} />
			{/snippet}
		</AnnotationLine>
	{/snippet}
</LineChart>
