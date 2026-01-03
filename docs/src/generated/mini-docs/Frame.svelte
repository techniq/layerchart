
<!--
	@component
	## Frame

	## Description

	Commonly used component representing a rectangular Chart bounding box and respecting padding or full size.

	## Category

	[[Common](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Common.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas), [HTML](/docs/components/html)

	Full Documentation: [Frame](/docs/components/Frame)

	## API Properties

	* full:<boolean>=false - Whether to include padding area 

	## Related

	[Rect](/docs/components/Rect)

	@example
	```svelte
	<script>
		import { Axis, Chart, Frame, Layer } from 'layerchart';
	</script>

	<Chart
		xDomain={[0, 100]}
		yDomain={[0, 100]}
		padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
		height={300}
	>
		<Layer>
			<Frame class="fill-danger/5" />
			<Axis placement="bottom" rule />
			<Axis placement="left" rule />
		</Layer>
	</Chart>
	```
-->
