
<!--
	@component
	## Path

	## Description

	Primitive component for rendering path elements with support for animation, markers, and custom content at path endpoints.

	## Category

	[[Primitives](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Primitives.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [Path](/docs/components/Path)

	## API Properties

	* pathData:<string | undefined | null> - Pass `<path d={...} />` explicitly instead of calculating
from data / context 
	* draw:<boolean | Parameters<typeof _drawTransition>[1]> - Whether to animate the drawing of the path over time.
Pass either `true` or an object with transition options to
enable the transition.

Works best with `tweened` disabled. 
	* marker:<MarkerOptions> - Marker to attach to both start and end points of the line 
	* markerMid:<MarkerOptions> - Marker to attach to the middle point of the line 
	* markerStart:<MarkerOptions> - Marker to attach to the start point of the line 
	* markerEnd:<MarkerOptions> - Marker to attach to the end point of the line 
	* startContent:<Snippet<[ { point: DOMPoint; value: { x: number; y: number; }; } ]>> - Add additional content at the start of the line.

Receives `{ point: DOMPoint; value: { x: number; y: number } }` as a snippet prop. 
	* endContent:<Snippet<[ { point: DOMPoint; value: { x: number; y: number; }; } ]>> - Add additional content at the end of the line.

Receives `{ point: DOMPoint; value: { x: number; y: number } }` as a snippet prop. 
	* pathRef:<SVGPathElement> - A reference to the `<path>` element. 
	* motion:<MotionProp> - undefined 
	* fill:<string> - Fill color 
	* fillOpacity:<number> - Fill opacity (0-1) 
	* stroke:<string> - Stroke color 
	* strokeWidth:<number> - Stroke width in pixels 
	* strokeOpacity:<number> - Stroke opacity (0-1) 
	* opacity:<number> - Overall opacity (0-1) 

	## Related

	[Arc](/docs/components/Arc)
	[Area](/docs/components/Area)
	[Bar](/docs/components/Bar)
	[Connector](/docs/components/Connector)
	[GeoPath](/docs/components/GeoPath)
	[MotionPath](/docs/components/MotionPath)
	[Spline](/docs/components/Spline)

	
-->
