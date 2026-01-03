
<!--
	@component
	## Labels

	## Description

	Marking component which displays text directly on a chart to identify or annotate specific data points.

	## Category

	[[Marks](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Marks.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [Labels](/docs/components/Labels)

	## API Properties

	* data:<T> - Override data instead of using context 
	* value:<Accessor<T>> - Override display value accessor.  By default, uses `y` unless yScale is band scale 
	* fill:<string | Accessor<T>> - The fill color of the label, which can either be a string or an accessor function
that returns a valid `fill` color value.

The accessor is useful for dynamic fill colors based on the data the label represents. 
	* x:<Accessor<T>> - Override `x` accessor from Chart context 
	* y:<Accessor<T>> - Override `y` accessor from Chart context 
	* placement:<'inside' | 'outside' | 'center'>='outside' - The placement of the label relative to the point 
	* offset:<number>=placement === 'center' ? 0 : 4 - The offset of the label from the point 
	* format:<FormatType | FormatConfig> - The format of the label 
	* key:<(d: T, index: number) => any>=(d, index) => index - Define unique value for {#each} `(key)` expressions to improve transitions.
`index` position used by default 
	* children:<Snippet<[ { data: Point; textProps: ComponentProps<typeof Text>; } ]>> - undefined 

	## Related

	[](/docs/components/)

	
-->
