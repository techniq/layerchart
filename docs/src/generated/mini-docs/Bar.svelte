
<!--
	@component
	## Bar

	## Description

	Primitive component creating individual rectangular bars to represent and compare discrete data values.

	## Category

	[[Primitives](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Primitives.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [Bar](/docs/components/Bar)

	## API Properties

	* data:<Object> - data to render the bar from  (REQUIRED)
	* x:<Accessor>=ctx.x - Override `x` from context. Useful for multiple Bar instances 
	* y:<Accessor>=ctx.y - Override `y` from context. Useful for multiple Bar instances 
	* x1:<Accessor>=ctx.x1 - Override `x1` from context. Useful for multiple Bar instances 
	* y1:<Accessor>=ctx.y1 - Override `y1` from context. Useful for multiple Bar instances 
	* radius:<number> - undefined 
	* insets:<Insets> - undefined 
	* initialX:<number> - undefined 
	* initialY:<number> - undefined 
	* initialHeight:<number> - undefined 
	* initialWidth:<number> - undefined 
	* rounded:<'all' | 'none' | 'edge' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'> - Control which corners are rounded with radius. Uses <path> instead of <rect> when not set
to `all` 
	* motion:<MotionProp<'x' | 'y' | 'width' | 'height'>> - undefined 
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

	
-->
