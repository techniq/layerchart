
<!--
	@component
	## Axis

	## Description

	Commonly used component displays the scale and reference lines on a chart, providing context for interpreting data values.

	## Category

	[[Common](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Common.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas), [HTML](/docs/components/html)

	Full Documentation: [Axis](/docs/components/Axis)

	## API Properties

	* placement:<'top' | 'bottom' | 'left' | 'right' | 'angle' | 'radius'> - Location of axis  (REQUIRED)
	* label:<string | Snippet<[ { props: ComponentProps<typeof Text>; } ]>> - The label for the axis.

Can either be a string or a snippet to render custom content.
The snippet receives spreadable props to apply to the label. 
	* labelPlacement:<'start' | 'middle' | 'end'>='middle' - Location of axis label 
	* labelProps:<Partial<ComponentProps<typeof Text>>> - Props applied to label Text 
	* rule:<boolean | Partial<ComponentProps<typeof Rule>>>=false - Draw a rule line. Use Rule component for greater rendering order control 
	* grid:<boolean | Pick<SVGAttributes<SVGElement>, 'class' | 'style'>>=false - Draw grid lines 
	* ticks:<TicksConfig> - Control the number of ticks 
	* tickSpacing:<number> - Width or height of each tick in pixels (enabling responsive count) 
	* tickMultiline:<boolean>=false - Whether to render tick labels on multiple lines for additional context 
	* tickLength:<number>=4 - Length of the tick line 
	* tickMarks:<boolean>=true - Whether to render tick marks. 
	* format:<FormatType | FormatConfig> - Format tick labels 
	* tickLabelProps:<Partial<ComponentProps<typeof Text>>> - Props to apply to each tick label 
	* tickLabel:<Snippet<[ { props: ComponentProps<typeof Text>; index: number; } ]>> - A snippet to render your own custom tick label. 
	* transitionIn:<In>=defaults to fade if the motion prop is set to tweened - Transition function for entering elements 
	* transitionInParams:<TransitionParams<In>>={ easing: cubicIn } - Parameters for the transitionIn function 
	* scale:<any> - Override scale for the axis 
	* classes:<{ root?: string; label?: string; rule?: string; tick?: string; tickLabel?: string; }>={} - Classes for styling various parts of the axis 
	* motion:<MotionProp> - undefined 

	## Related

	[Grid](/docs/components/Grid)
	[Rule](/docs/components/Rule)

	@example
	```svelte
	<script lang="ts">
		import { Axis, Chart, Layer } from 'layerchart';
		import { timeDay } from 'd3-time';
		import { startOfInterval } from '@layerstack/utils';

		const today = startOfInterval('day', new Date());
	</script>

	<Chart
		xDomain={[timeDay.offset(today, -10), today]}
		yDomain={[0, 100]}
		yNice
		padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
		height={300}
	>
		<Layer>
			<Axis placement="bottom" />
			<Axis placement="left" />
		</Layer>
	</Chart>
	```
-->
