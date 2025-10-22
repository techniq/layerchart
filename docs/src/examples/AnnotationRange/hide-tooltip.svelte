<script lang="ts">
	import { AnnotationRange, LineChart } from 'layerchart';
	import { getAppleStock } from '$lib/data.remote';

	const data = $derived(await getAppleStock());

	export { data };
</script>

<LineChart {data} x="date" y="value" height={300}>
	{#snippet aboveMarks({ context })}
		<AnnotationRange
			x={[new Date('2010-01-01'), null]}
			pattern={{
				size: 8,
				lines: {
					rotate: -45,
					opacity: 0.2
				}
			}}
			props={{
				rect: {
					onpointermove: (e) => {
						e.stopPropagation();
						context.tooltip.hide();
					}
				}
			}}
		/>
	{/snippet}
</LineChart>
