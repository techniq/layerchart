
<!--
	@component
	## AnnotationLine

	## Description

	Annotation component drawing a straight marker across the chart to indicate a specific value, trend, or threshold.

	## Category

	[[Annotations](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Annotations.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas), [HTML](/docs/components/html)

	Full Documentation: [AnnotationLine](/docs/components/AnnotationLine)

	## API Properties

	* x:<SingleDomainType> - x value of the point 
	* y:<SingleDomainType> - y value of the point 
	* label:<string> - Label to display for line 
	* labelPlacement:<Placement> - Placement of the label 
	* labelXOffset:<number> - X offset of the label 
	* labelYOffset:<number> - Y offset of the label 
	* props:<{ label?: Partial<ComponentProps<typeof Text>>; line?: Partial<ComponentProps<typeof Line>>; }> - Classes for inner elements 
	* fill:<string> - Fill color 
	* fillOpacity:<number> - Fill opacity (0-1) 
	* stroke:<string> - Stroke color 
	* strokeWidth:<number> - Stroke width in pixels 
	* strokeOpacity:<number> - Stroke opacity (0-1) 
	* opacity:<number> - Overall opacity (0-1) 

	## Related

	[AnnotationPoint](/docs/components/AnnotationPoint)
	[AnnotationRange](/docs/components/AnnotationRange)

	@example
	```svelte
	<script lang="ts">
		import { AnnotationLine, LineChart } from 'layerchart';
		import { getAppleStock } from '$lib/data.remote';

		const data = await getAppleStock();
	</script>

	<LineChart {data} x="date" y="value" height={300} padding={{ top: 10, bottom: 20, left: 25 }}>
		{#snippet aboveMarks({ context })}
			<AnnotationLine
				y={500}
				label="Max"
				props={{
					line: { class: '[stroke-dasharray:2,2] stroke-danger' },
					label: { class: 'fill-danger' }
				}}
			/>
		{/snippet}
	</LineChart>
	```
-->
