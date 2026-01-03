
<!--
	@component
	## Svg

	## Description

	Svg layer

	## Category

	[[Layers](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Layers.md)]

	## Layers

	[](/docs/components/)

	Full Documentation: [Svg](/docs/components/Svg)

	## API Properties

	* ref:<SVGSVGElement> - A reference to the layer's `<svg>` tag. 
	* innerRef:<SVGGElement> - A reference to the layer's `<g>` tag. 
	* zIndex:<number> - The layer's z-index. 
	* pointerEvents:<boolean> - Set this to `false` to set `pointer-events: none;` on the entire layer. 
	* viewBox:<string> - A string passed to the `viewBox` property on the `<svg>` tag. 
	* title:<string | Snippet> - Shorthand to set the contents of `<title></title>` for accessibility.
You can also set arbitrary HTML via the title snippet but this is a convenient shorthand. 
	* defs:<Snippet> - The inner content of the `<defs>` tag. 
	* center:<boolean | 'x' | 'y'> - Translate children to center (useful for radial layouts) 
	* ignoreTransform:<boolean> - Ignore TransformContext.
Useful to add static elements such as legends. 
	* children:<Snippet<[ { ref: SVGElement; } ]>> - undefined 

	## Related

	[Layer](/docs/components/Layer)

	
-->
