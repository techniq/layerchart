
<!--
	@component
	## Html

	## Description

	Html layer

	## Category

	[[Layers](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Layers.md)]

	## Layers

	[](/docs/components/)

	Full Documentation: [Html](/docs/components/Html)

	## API Properties

	* ref:<HTMLElement> - A reference to the layer's outermost `<div>` tag. 
	* zIndex:<number> - The layer's z-index. 
	* pointerEvents:<boolean> - Set this to `false` to set `pointer-events: none;` on the entire layer. 
	* role:<string> - A string passed to the `aria-role` on the `<div>` tag.
This is `undefined` by default but will be set by default to `'figure'`
if `label`, `labelledby` or `describedby` is set. That default will be overridden by whatever is passed in. 
	* center:<boolean | 'x' | 'y'> - Translate children to center (useful for radial layouts) 
	* ignoreTransform:<boolean> - Ignore TransformContext.  Useful to add static elements such as legends. 
	* children:<Snippet<[ { ref: HTMLElement; } ]>> - undefined 

	## Related

	[Layer](/docs/components/Layer)

	
-->
