<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import { AnnotationLine, LineChart, type Placement } from 'layerchart';
	import AnnotationLineControls from '$lib/components/controls/AnnotationRangePointLineControls.svelte';

	let placement: Placement = $state('top');
	let xOffset = $state(0);
	let yOffset = $state(0);

	export { data };
</script>

<AnnotationLineControls bind:placement bind:xOffset bind:yOffset />

<LineChart {data} x="date" y="value" height={300} padding={{ top: 10, bottom: 20, left: 25 }}>
	{#snippet aboveMarks()}
		<AnnotationLine
			y1={200}
			y2={600}
			label={placement}
			labelPlacement={placement}
			labelXOffset={xOffset}
			labelYOffset={yOffset}
			props={{
				line: { dashArray: [2, 2], stroke: 'var(--color-danger)' },
				label: { fill: 'var(--color-danger)' }
			}}
		/>
	{/snippet}
</LineChart>
