
<!--
	@component
	## AnnotationRange

	## Description

	Annotation component highlighting a continuous span or interval on a chart to emphasize specific data ranges or thresholds.

	## Category

	[[Annotations](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Annotations.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas), [HTML](/docs/components/html)

	Full Documentation: [AnnotationRange](/docs/components/AnnotationRange)

	## API Properties

	* x:<[ SingleDomainType, SingleDomainType ] | SingleDomainType[]> - x values of the range 
	* y:<[ SingleDomainType, SingleDomainType ] | SingleDomainType[]> - y values of the range 
	* label:<string> - Label to display for line 
	* labelPlacement:<Placement> - Placement of the label 
	* labelXOffset:<number> - X offset of the label 
	* labelYOffset:<number> - Y offset of the label 
	* fill:<string> - Add Rect with fill 
	* class:<string> - Add Rect with class 
	* gradient:<ComponentProps<typeof LinearGradient>> - Add Rect with gradient 
	* pattern:<ComponentProps<typeof Pattern>> - Add Rect with pattern 
	* props:<{ label?: Partial<ComponentProps<typeof Text>>; rect?: Partial<ComponentProps<typeof Rect>>; }> - Classes for inner elements 
	* fill:<string> - Fill color 
	* fillOpacity:<number> - Fill opacity (0-1) 
	* stroke:<string> - Stroke color 
	* strokeWidth:<number> - Stroke width in pixels 
	* strokeOpacity:<number> - Stroke opacity (0-1) 
	* opacity:<number> - Overall opacity (0-1) 

	## Related

	[AnnotationLine](/docs/components/AnnotationLine)
	[AnnotationPoint](/docs/components/AnnotationPoint)

	@example
	```svelte
	<script lang="ts">
		import { AnnotationRange, LineChart, defaultChartPadding } from 'layerchart';
		import { getAppleStock } from '$lib/data.remote';

		const data = await getAppleStock();
	</script>

	<LineChart
		{data}
		x="date"
		y="value"
		height={300}
		padding={defaultChartPadding({ left: 25, bottom: 15 })}
	>
		{#snippet belowMarks({ context })}
			<AnnotationRange
				x={[new Date('2010-01-01'), new Date('2010-12-31')]}
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
	```
-->
