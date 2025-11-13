<script lang="ts">
	import { AnnotationPoint, LineChart, type Placement } from 'layerchart';
	import AnnotationPointControls from '$lib/components/AnnotationRangePointLineControls.svelte';
	import { Button, Field, Menu, RangeField, Toggle } from 'svelte-ux';
	import { maxIndex } from 'd3-array';
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
	let placement: Placement = $state('top');
	let xOffset = $state(0);
	let yOffset = $state(0);
	let radius = $state(4);

	export { data };
</script>

<AnnotationPointControls bind:placement bind:xOffset bind:yOffset bind:radius includeRadius />
<LineChart {data} x="date" y="value" height={300} padding={{ left: 25, bottom: 15 }}>
	{#snippet aboveMarks({ context })}
		{@const maxPoint = data[maxIndex(data, (d) => d.value)]}
		<AnnotationPoint
			x={maxPoint.date}
			y={maxPoint.value}
			r={radius}
			label={placement}
			labelPlacement={placement}
			labelXOffset={xOffset}
			labelYOffset={yOffset}
			props={{
				circle: { class: 'fill-secondary' },
				label: { class: 'fill-secondary font-bold' }
			}}
		/>
	{/snippet}
</LineChart>
