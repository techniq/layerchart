
<!--
	@component
	## Canvas

	## Description

	Canvas layer

	## Category

	[[Layers](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Layers.md)]

	## Layers

	[](/docs/components/)

	Full Documentation: [Canvas](/docs/components/Canvas)

	## API Properties

	* ref:<HTMLCanvasElement> - The `<canvas>` tag. Useful for bindings. 
	* canvasContext:<CanvasRenderingContext2D> - The `<canvas>`'s 2d context. Useful for bindings. 
	* willReadFrequently:<boolean>=false - Force the use of a software (instead of hardware accelerated) 2D canvas, which can
save memory when calling getImageData() frequently. 
	* zIndex:<number>=0 - The `z-index` style to apply to the layer. 
	* pointerEvents:<boolean>=true - 
Whether pointer events should be enabled on the canvas.

- `false`: `pointer-events: none;` will be set on the entire layer.
- `true`: pointer events will operate normally. 
	* fallback:<string | Snippet> - The content to display if canvas is not supported or cannot be rendered.
This can either be a string or a snippet with custom markup. 
	* center:<boolean | 'x' | 'y'>=false - Translate children to center of the canvas (useful for radial layouts). 
	* ignoreTransform:<boolean>=false - Ignore TransformContext.

Useful to add static elements such as legends. 
	* disableHitCanvas:<boolean>=false - Disable the hit canvas (useful when animations are playing) 
	* debug:<boolean>=false - Show the hit canvas for debugging purposes. 
	* children:<Snippet<[ { ref: HTMLCanvasElement; canvasContext: CanvasRenderingContext2D | undefined; } ]>> - undefined 

	## Related

	[Layer](/docs/components/Layer)

	
-->
