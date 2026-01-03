
<!--
	@component
	## Rect

	## Description

	Primitive component which draws a rectangle to highlight areas, ranges, or specific regions of interest.

	## Category

	[[Primitives](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Primitives.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas), [HTML](/docs/components/html)

	Full Documentation: [Rect](/docs/components/Rect)

	## API Properties

	* x:<number>=0 - undefined 
	* initialX:<number>=x - undefined 
	* y:<number>=0 - undefined 
	* initialY:<number>=y - undefined 
	* width:<number> - undefined  (REQUIRED)
	* initialWidth:<number> - undefined 
	* height:<number> - undefined  (REQUIRED)
	* initialHeight:<number> - undefined 
	* ref:<SVGRectElement> - Underlying `<rect>` tag when using <Svg>. Useful for bindings. 
	* motion:<MotionProp<'x' | 'y' | 'width' | 'height'>> - undefined 
	* children:<Snippet> - Children content to render.  Note: Only works for Html layers 
	* fill:<string> - Fill color 
	* fillOpacity:<number> - Fill opacity (0-1) 
	* stroke:<string> - Stroke color 
	* strokeWidth:<number> - Stroke width in pixels 
	* strokeOpacity:<number> - Stroke opacity (0-1) 
	* opacity:<number> - Overall opacity (0-1) 
	* onclick:<MouseEventHandler<Element> | null> - Click event handler 
	* ondblclick:<MouseEventHandler<Element> | null> - Double click event handler 
	* onpointerenter:<PointerEventHandler<Element> | null> - Pointer enter event handler 
	* onpointermove:<PointerEventHandler<Element> | null> - Pointer move event handler 
	* onpointerleave:<PointerEventHandler<Element> | null> - Pointer leave event handler 
	* onpointerover:<PointerEventHandler<Element> | null> - Pointer over event handler 
	* onpointerout:<PointerEventHandler<Element> | null> - Pointer out event handler 

	## Related

	[Bars](/docs/components/Bars)
	[Highlight](/docs/components/Highlight)
	[RectClipPath](/docs/components/RectClipPath)

	@example
	```svelte
	<script lang="ts">
		import { Axis, Chart, Rect, Layer } from 'layerchart';
	</script>

	<Chart
		xDomain={[0, 100]}
		yDomain={[0, 100]}
		padding={{ top: 10, bottom: 20, left: 24, right: 10 }}
		height={300}
	>
		<Layer>
			<Axis placement="bottom" rule />
			<Axis placement="left" rule />
			<Rect x={50} y={50} width={100} height={150} />
			<Rect x={90} y={80} width={200} height={100} class="fill-primary bg-primary" />
			<Rect
				x={125}
				y={40}
				width={200}
				height={100}
				class="stroke-primary fill-none border border-primary bg-transparent"
			/>
		</Layer>
	</Chart>
	```
-->
