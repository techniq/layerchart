
<!--
	@component
	## Link

	## Description

	Marking component which highlights or connects specific data points on a chart to emphasize relationships or sequences.

	## Category

	[[Marks](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Marks.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [Link](/docs/components/Link)

	## API Properties

	* data:<any> - undefined 
	* sankey:<boolean>=false - Update source and target accessors to be compatible with d3-sankey.  see: https://github.com/d3/d3-sankey#sankeyLinkHorizontal 
	* source:<(d: any) => any> - undefined 
	* target:<(d: any) => any> - undefined 
	* orientation:<'vertical' | 'horizontal'> - Convenient property to swap x/y accessor logic 
	* x:<(d: any) => any> - undefined 
	* y:<(d: any) => any> - undefined 
	* curve:<CurveFactory> - undefined 
	* marker:<MarkerOptions> - Marker to attach to both start and end points of the line 
	* markerMid:<MarkerOptions> - Marker to attach to the middle point of the line 
	* markerStart:<MarkerOptions> - Marker to attach to the start point of the line 
	* markerEnd:<MarkerOptions> - Marker to attach to the end point of the line 
	* explicitCoords:<{ x1: number; y1: number; x2: number; y2: number; }> - Apply explicit coordinates to the line. Useful when dealing with
force simulation links. 
	* motion:<MotionTweenOption | MotionNoneOption> - undefined 

	## Related

	[Connector](/docs/components/Connector)
	[Points](/docs/components/Points)

	
-->
