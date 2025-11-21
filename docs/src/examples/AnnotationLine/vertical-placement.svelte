<script lang="ts">
	import { AnnotationLine, LineChart, type Placement } from 'layerchart';
	import AnnotationLineControls from '$lib/components/controls/AnnotationRangePointLineControls.svelte';
	import { getAppleStock } from '$lib/data.remote';

	const data = await getAppleStock();

	let placement: Placement = $state('top-right');
	let xOffset = $state(5);
	let yOffset = $state(0);

	export { data };
</script>

<AnnotationLineControls bind:placement bind:xOffset bind:yOffset />

<LineChart {data} x="date" y="value" height={300} padding={{ top: 10, bottom: 20, left: 25 }}>
	{#snippet aboveMarks({ context })}
		<AnnotationLine
			x={new Date('2010-03-30')}
			label={placement}
			labelPlacement={placement}
			labelXOffset={xOffset}
			labelYOffset={yOffset}
			props={{
				line: { class: '[stroke-dasharray:2,2] stroke-danger' },
				label: { class: 'fill-danger' }
			}}
		/>
	{/snippet}
</LineChart>
