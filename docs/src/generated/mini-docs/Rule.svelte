
<!--
	@component
	## Rule

	## Description

	Commonly used component acting as a visual guideline on a chart that helps align and measure data values along an axis.

	## Category

	[[Common](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Common.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas), [HTML](/docs/components/html)

	Full Documentation: [Rule](/docs/components/Rule)

	## API Properties

	* data:<any> - Override the data from the context. 
	* x:<number | Date | boolean | '$left' | '$right' | Accessor>=false - Create a vertical `x` line
- If true or 'left', will draw at chart left (xRange[0])
- If 'right', will draw at chart right (xRange[1])
- Use `0` for baseline (yScale(0))
- Use number | Date value for annotation (yScale(value)) 
	* xOffset:<number>=0 - Pixel offset to apply to `x` coordinate 
	* y:<number | Date | boolean | '$top' | '$bottom' | Accessor>=false - Create a horizontal `y` line
- If true or 'bottom', will draw at chart bottom (yRange[0])
- If 'top', will draw at chart top (yRange[1])
- Use `0` for baseline (xScale(0))
- Use number | Date value for annotation (xScale(value)) 
	* yOffset:<number>=0 - Pixel offset to apply to `y` coordinate 

	## Related

	[Axis](/docs/components/Axis)
	[Line](/docs/components/Line)
	[AnnotationLine](/docs/components/AnnotationLine)

	@example
	```svelte
	<script>
		import { Axis, Chart, Layer, Rule } from 'layerchart';
	</script>

	<Chart xDomain={[0, 100]} yDomain={[0, 100]} padding={20} height={300}>
		<Layer>
			<Axis placement="bottom" />
			<Axis placement="left" />
			<Rule x y />
		</Layer>
	</Chart>
	```
-->
