
<!--
	@component
	## Group

	## Description

	Primitive component which clusters multiple chart elements together, allowing them to be managed, styled, or transformed as a single unit.

	## Category

	[[Primitives](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Primitives.md)]

	## Layers

	[SVG](/docs/components/svg), [HTML](/docs/components/html)

	Full Documentation: [Group](/docs/components/Group)

	## API Properties

	* x:<number> - Translate x 
	* initialX:<number>=x - Initial translate x 
	* y:<number> - Translate y 
	* initialY:<number>=y - Initial translate y 
	* center:<boolean | 'x' | 'y'>=false - Center within chart 
	* preventTouchMove:<boolean>=false - Prevent `touchmove` default, which can interfere with `pointermove` when
used with `Tooltip`, for example. 
	* opacity:<number> - The opacity of the element. (0 to 1) 
	* children:<Snippet> - undefined 
	* ref:<Element> - A reference to the rendered DOM element, which could be
either nothing, a `<g>` element (when using `<Svg>`), or a `<div>` element
(when using `<Html>`). 
	* motion:<MotionProp> - undefined 
	* transitionIn:<In>=defaults to fade if the motion prop is set to tweened - Transition function for entering elements 
	* transitionInParams:<TransitionParams<In>>={ easing: cubicIn } - Parameters for the transitionIn function 

	## Related

	[](/docs/components/)

	@example
	```svelte
	<script lang="ts">
		import { Axis, Chart, Circle, Group, Text, Layer } from 'layerchart';
	</script>

	<Chart xDomain={[0, 100]} yDomain={[0, 100]} padding={{ bottom: 20, left: 20 }} height={300}>
		<Layer>
			<Axis placement="bottom" rule />
			<Axis placement="left" rule />
			<Group center>
				<Circle r={20} class="fill-surface-content" />
			</Group>
			<Group x={100} y={100}>
				<Circle r={10} class="fill-surface-content" />
				<Text value="point" textAnchor="middle" verticalAnchor="start" class="text-xs" dy={12} />
			</Group>
		</Layer>
	</Chart>
	```
-->
