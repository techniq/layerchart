
<!--
	@component
	## ClipPath

	## Description

	Clipping component which defines a clipping region to constrain the rendering of chart elements within a specified shape or boundary.

	## Category

	[[Clipping](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Clipping.md)]

	## Layers

	[SVG](/docs/components/svg)

	Full Documentation: [ClipPath](/docs/components/ClipPath)

	## API Properties

	* id:<string> - A unique id for the clipPath. 
	* useId:<string> - Use existing path or shape (by id) for clipPath 
	* disabled:<boolean>=false - Whether to disable clipping (show all). 
	* clip:<Snippet<[ { id: string; } ]>> - A snippet to insert content into the clipPath.
Provides the id for the clipPath as a snippet prop. 
	* children:<Snippet<[ { id: string; url: string; useId?: string; } ]>> - Children to render in the `<g>` element that links to the clipPath (if not disabled).
Provides the id, url, and useId for the clipPath as snippet props. 

	## Related

	[components/ChartClipPath](/docs/components/components/ChartClipPath)
	[components/CircleClipPath](/docs/components/components/CircleClipPath)
	[components/RectClipPath](/docs/components/components/RectClipPath)
	[components/Threshold](/docs/components/components/Threshold)

	
-->
