<script lang="ts">
	import { AnnotationRange, LineChart, type Placement } from 'layerchart';
	import AnnotationRangeControls from '$lib/components/AnnotationRangePointLineControls.svelte';

	import { getAppleStock } from '$lib/data.remote';

	const data = await getAppleStock();

	const placementOptions = [
		'top-left',
		'top',
		'top-right',
		'left',
		'center',
		'right',
		'bottom-left',
		'bottom',
		'bottom-right'
	] as const;
	let placement: Placement = $state('center');
	let xOffset = $state(0);
	let yOffset = $state(0);

	export { data };
</script>

<AnnotationRangeControls bind:placement bind:xOffset bind:yOffset />
<LineChart {data} x="date" y="value" height={300} padding={{ left: 25, bottom: 5 }}>
	{#snippet aboveMarks({ context })}
		<AnnotationRange
			x={[new Date('2010-01-01'), new Date('2010-12-31')]}
			pattern={{
				size: 8,
				lines: {
					rotate: -45,
					opacity: 0.2
				}
			}}
			label={placement}
			labelPlacement={placement}
			labelXOffset={xOffset}
			labelYOffset={yOffset}
		/>
	{/snippet}
</LineChart>
