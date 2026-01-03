
<!--
	@component
	## Highlight

	## Description

	Interaction component manages and displays tooltips allowing dynamic information to appear in response to user interactions.

	## Category

	[[Interactions](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Interactions.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [Highlight](/docs/components/Highlight)

	## API Properties

	* data:<any> - Highlight specific data (annotate), especte uses tooltip data 
	* x:<Accessor> - Override `x` from context 
	* y:<Accessor> - Override `y` from context 
	* axis:<'x' | 'y' | 'both' | 'none'> - undefined 
	* points:<boolean | Partial<ComponentProps<typeof Circle>> | Snippet<[ { points: { x: number; y: number; fill: string; data: HighlightPointData; }[]; } ]>>=false - Show points and pass props to Circles 
	* lines:<boolean | Partial<ComponentProps<typeof Line>> | Snippet<[ { lines: { x1: number; y1: number; x2: number; y2: number; }[]; } ]>>=false - Show lines and pass props to Lines 
	* area:<boolean | Partial<ComponentProps<typeof Rect>> | Snippet<[ { area: { x: number; y: number; width: number; height: number; }; } ]>>=false - Show area and pass props to Rect 
	* bar:<boolean | Partial<ComponentProps<typeof Bar>> | Snippet>=false - Show bar and pass props to Rect 
	* motion:<MotionProp>=true - Set to false to disable spring transitions 
	* opacity:<number> - The opacity of the element. (0 to 1) 
	* onAreaClick:<(e: MouseEvent, detail: { data: any; }) => void> - undefined 
	* onBarClick:<(e: MouseEvent, detail: { data: any; }) => void> - undefined 
	* onPointClick:<(e: MouseEvent, detail: { point: HighlightPoint; data: any; }) => void> - undefined 
	* onPointEnter:<(e: MouseEvent, detail: { point: HighlightPoint; data: any; }) => void> - undefined 
	* onPointLeave:<(e: MouseEvent, detail: { point: HighlightPoint; data: any; }) => void> - undefined 

	## Related

	[Tooltip](/docs/components/Tooltip)
	[TooltipContext](/docs/components/TooltipContext)

	
-->
