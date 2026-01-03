
<!--
	@component
	## TooltipContext

	## Description

	Interaction component manages and provides the data and behavior needed to display dynamic tooltips within a chart.

	## Category

	[[Interactions](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Interactions.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [TooltipContext](/docs/components/TooltipContext)

	## API Properties

	* mode:<TooltipMode>='manual' - The tooltip interaction mode 
	* findTooltipData:<'closest' | 'left' | 'right'>='closest' - Method to find tooltip data 
	* raiseTarget:<boolean>=false - Similar to d3-selection's raise, re-insert the e.target as the last child of its parent, so
to be the top-most element 
	* locked:<boolean>=false - Lock tooltip (keep open, do not update on mouse movement). Allows for clicking on tooltip 
	* touchEvents:<'none' | 'pan-x' | 'pan-y' | 'auto'>='pan-y' - Controls the touch event behavior on the tooltip container.
By default uses `pan-y` to allow verticle scrolling but horizontal scrubbing.
Use `none` to disable all touch events (useful for improved transform/geo charts interactions) 
	* radius:<number>=Infinity - quadtree search or voronoi clip radius 
	* debug:<boolean>=false - Enable debug view (show hit targets, etc) 
	* onclick:<(e: MouseEvent, { data }: { data: any; }) => any>=() => {} - Click handler for the tooltip 
	* tooltipContext:<TooltipContextValue<T>>={ x: 0, y: 0, data: null, show: showTooltip, hide: hideTooltip, mode } - Exposed to allow binding in Chart 
	* hideDelay:<number>=0 - Delay in ms before hiding tooltip 
	* ref:<HTMLElement> - A reference to the tooltip container element. 
	* children:<Snippet<[ { tooltipContext: TooltipContextValue<T>; } ]>> - undefined 

	## Related

	[Chart](/docs/components/Chart)
	[Tooltip](/docs/components/Tooltip)
	[Highlight](/docs/components/Highlight)

	
-->
