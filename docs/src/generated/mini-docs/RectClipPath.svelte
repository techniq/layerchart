
<!--
	@component
	## RectClipPath

	## Description

	Clipping component which defines a rectangular clip region  to constrain the rendering of chart elements within a specified shape or boundary.

	## Category

	[[Clipping](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Clipping.md)]

	## Layers

	[SVG](/docs/components/svg)

	Full Documentation: [RectClipPath](/docs/components/RectClipPath)

	## API Properties

	* id:<string> - A unique id for the clipPath. 
	* x:<number>=0 - The x position of the clipPath. 
	* y:<number>=0 - The y position of the clipPath. 
	* width:<number> - The width of the clipPath.  (REQUIRED)
	* height:<number> - The height of the clipPath.  (REQUIRED)
	* disabled:<boolean>=false - Whether to disable clipping (show all). 
	* children:<Snippet<[ { id: string; url: string; } ]>> - The default children snippet which provides
the id and url for the clipPath. 
	* motion:<MotionProp<'x' | 'y' | 'width' | 'height'>> - undefined 
	* onclick:<MouseEventHandler<Element> | null> - Click event handler 
	* ondblclick:<MouseEventHandler<Element> | null> - Double click event handler 
	* onpointerenter:<PointerEventHandler<Element> | null> - Pointer enter event handler 
	* onpointermove:<PointerEventHandler<Element> | null> - Pointer move event handler 
	* onpointerleave:<PointerEventHandler<Element> | null> - Pointer leave event handler 
	* onpointerover:<PointerEventHandler<Element> | null> - Pointer over event handler 
	* onpointerout:<PointerEventHandler<Element> | null> - Pointer out event handler 

	## Related

	[ChartClipPath](/docs/components/ChartClipPath)

	
-->
