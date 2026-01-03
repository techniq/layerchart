
<!--
	@component
	## Grid

	## Description

	Commonly used component which draws horizontal and vertical lines respecting scales across a chart to enhance readability and help align data points with axis values.

	## Category

	[[Common](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Common.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas), [HTML](/docs/components/html)

	Full Documentation: [Grid](/docs/components/Grid)

	## API Properties

	* x:<boolean | Pick<SVGAttributes<SVGElement>, 'class' | 'style'>>=false - Draw a x-axis lines 
	* y:<boolean | Pick<SVGAttributes<SVGElement>, 'class' | 'style'>>=false - Draw a y-axis lines 
	* xTicks:<TicksConfig> - Control the number of x-axis ticks 
	* yTicks:<TicksConfig>=!isScaleBand(ctx.yScale) ? 4 : undefined - Control the number of y-axis ticks 
	* bandAlign:<'center' | 'between'>='center' - Line alignment when band scale is used (x or y axis) 
	* radialY:<'circle' | 'linear'>='circle' - Render `y` lines with circles or linear splines 
	* classes:<{ root?: string; line?: string; }>={} - Classes to apply to the rendered elements. 
	* transitionIn:<In>=defaults to fade if motion is tweened - Transition function for entering elements 
	* transitionInParams:<TransitionParams<In>>={ easing: cubicIn } - Parameters for the transitionIn function 
	* ref:<SVGGElement> - A reference to the underlying outermost `<g>` element. 
	* motion:<MotionProp> - undefined 

	## Related

	[Axis](/docs/components/Axis)
	[Rule](/docs/components/Rule)

	@example
	```svelte
	<script>
		import { Chart, Grid, Layer } from 'layerchart';
	</script>

	<Chart xDomain={[0, 100]} yDomain={[0, 100]} height={300}>
		<Layer>
			<Grid x y />
		</Layer>
	</Chart>
	```
-->
