
<!--
	@component
	## Area

	## Description

	Marking component which shades the space under a line on a chart to emphasize the magnitude and trend of data over a range.

	## Category

	[[Marks](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Marks.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [Area](/docs/components/Area)

	## API Properties

	* data:<any> - Override data instead of using context 
	* pathData:<string | null> - Pass `<path d={...} />` explicitly instead of calculating from data / context 
	* x:<Accessor> - Override x accessor 
	* y0:<Accessor> - Override y0 accessor. Defaults to max($yRange) 
	* y1:<Accessor> - Override y1 accessor. Defaults to y accessor 
	* motion:<MotionProp> - Whether to tween the interpolated path data using d3-interpolate-path 
	* clipPath:<string> - undefined 
	* curve:<CurveFactory> - undefined 
	* defined:<Parameters<D3Area<any>['defined']>[0]> - undefined 
	* line:<boolean | Partial<ComponentProps<typeof Spline>>>=false - Enable showing line 
	* fill:<string> - Fill color 
	* fillOpacity:<number> - Fill opacity (0-1) 
	* stroke:<string> - Stroke color 
	* strokeWidth:<number> - Stroke width in pixels 
	* strokeOpacity:<number> - Stroke opacity (0-1) 
	* opacity:<number> - Overall opacity (0-1) 

	## Related

	[](/docs/components/)

	@example
	```svelte
	<script lang="ts">
		import { Area, Axis, Chart, Layer } from 'layerchart';

		import { createDateSeries } from '$lib/utils/data.js';

		const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	</script>

	<Chart {data} x="date" y="value" yDomain={[0, null]} yNice padding={20} height={300}>
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />
			<Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/30" />
		</Layer>
	</Chart>
	```
-->
