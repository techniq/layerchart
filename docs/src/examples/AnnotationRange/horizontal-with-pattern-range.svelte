<script lang="ts">
	import { AnnotationRange, LineChart } from 'layerchart';
	import { getAppleStock } from '$lib/data.remote';

	const data = await getAppleStock();

	export { data };
</script>

<LineChart {data} x="date" y="value" height={300}>
	{#snippet belowMarks({ context })}
		<AnnotationRange
			y={[300, 500]}
			pattern={{
				size: 8,
				lines: {
					rotate: -45,
					opacity: 0.2
				}
			}}
		/>
	{/snippet}
</LineChart>
