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
			x={new Date('2010-03-30')}
			label="Event"
			labelXOffset={4}
			props={{
				line: { dashArray: [2, 2], stroke: 'var(--color-danger)' },
				label: { fill: 'var(--color-danger)' }
			}}
		/>
	{/snippet}
</LineChart>
