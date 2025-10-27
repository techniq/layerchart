<script lang="ts">
	import { AnnotationRange, LineChart } from 'layerchart';
	import { getAppleStock } from '$lib/data.remote';

	const data = await getAppleStock();

	export { data };
</script>

<LineChart {data} x="date" y="value" height={300}>
	{#snippet belowMarks({ context })}
		<AnnotationRange y={[0, 400]} class="fill-success/10" />
		<AnnotationRange y={[400, 600]} class="fill-warning/10" />
		<AnnotationRange y={[600, null]} class="fill-danger/10" />
	{/snippet}
</LineChart>
