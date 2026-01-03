
<!--
	@component
	## Threshold

	## Description

	Marking component visualizing data relative to predefined limits, highlighting values that exceed or fall below set thresholds.

	## Category

	[[Marks](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Marks.md)]

	## Layers

	[SVG](/docs/components/svg)

	Full Documentation: [Threshold](/docs/components/Threshold)

	## API Properties

	* curve:<CurveFactory> - The curve factory to use for the area. 
	* defined:<ComponentProps<typeof Area>['defined']> - Function to determine if a point is defined. 
	* above:<Snippet<[ ThresholdSnippetProps ]>> - Content to render above the threshold area. 
	* below:<Snippet<[ ThresholdSnippetProps ]>> - Content to render below the threshold area. 
	* children:<Snippet<[ ThresholdSnippetProps ]>> - undefined 

	## Related

	[Threshold](/docs/components/Threshold)
	[AreaChart](/docs/components/AreaChart)

	@example
	```svelte
	<script lang="ts">
		import { curveStepAfter } from 'd3-shape';
		import { AreaChart, Area, Spline, Threshold } from 'layerchart';
		import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
		import { createDateSeries } from '$lib/utils/data.js';

		let selectedCurve = $state(curveStepAfter);

		const data = createDateSeries({
			count: 30,
			min: 50,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});
	</script>

	<CurveMenuField bind:value={selectedCurve} class="mb-6" />

	<AreaChart
		{data}
		x="date"
		y={['value', 'baseline']}
		padding={{ left: 16, bottom: 24 }}
		tooltip={false}
		height={300}
	>
		{#snippet marks()}
			<Threshold curve={selectedCurve}>
				{#snippet above({ curve })}
					<Area y0="value" y1="baseline" {curve} class="fill-success/30" />
				{/snippet}

				{#snippet children({ curve })}
					<Spline y="baseline" {curve} class="[stroke-dasharray:4]" />
					<Spline y="value" {curve} class="stroke-[1.5]" />
				{/snippet}

				{#snippet below({ curve })}
					<Area y0="value" y1="baseline" {curve} class="fill-danger/30" />
				{/snippet}
			</Threshold>
		{/snippet}
	</AreaChart>
	```
-->
