
<!--
	@component
	## Legend

	## Description

	Commonly used component which explains the symbols, colors, or patterns used in a chart, helping interpret the represented data categories. Filtering and toggling visibility of data series can be enabled for interactivity.

	## Category

	[[Common](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Common.md)]

	## Layers

	[HTML](/docs/components/html)

	Full Documentation: [Legend](/docs/components/Legend)

	## API Properties

	* scale:<AnyScale> - undefined 
	* title:<string>='' - The title of the legend. 
	* width:<number>=320 - The width of the legend. 
	* height:<number>=10 - The height of the legend. 
	* ticks:<number>=width / 64 - The number of ticks to show on the scale. 
	* tickFormat:<FormatType | FormatConfig> - undefined 
	* tickValues:<any[]> - undefined 
	* tickFontSize:<number>=10 - The font size of the tick labels. 
	* tickLength:<number>=4 - The length of the tick marks. 
	* placement:<Placement> - The placement of the legend. 
	* orientation:<'horizontal' | 'vertical'>='horizontal' - The orientation of the legend. 
	* variant:<'ramp' | 'swatches'>='ramp' - Determine display ramp (individual color swatches or continuous ramp) 
	* selected:<string[]> - An array of selected items. If provided, the legend fades unselected items. 
	* classes:<{ root?: string; title?: string; label?: string; tick?: string; items?: string; swatch?: string; item?: string | ((item: LegendItem) => string); }>={} - Classes to apply to the elements. 
	* onclick:<(e: MouseEvent, detail: LegendItem) => any> - undefined 
	* onpointerenter:<(e: MouseEvent, detail: LegendItem) => any> - undefined 
	* onpointerleave:<(e: MouseEvent, detail: LegendItem) => any> - undefined 
	* ref:<HTMLElement> - A bindable reference to the wrapping `<div>` element. 
	* children:<Snippet<[ { values: any[]; scale: AnyScale | null; } ]>> - undefined 

	## Related

	[](/docs/components/)

	@example
	```svelte
	<script>
		import { Legend } from 'layerchart';
		import { scaleSequential } from 'd3-scale';
		import { interpolateViridis } from 'd3-scale-chromatic';
	</script>

	<div class="grid gap-6">
		<Legend scale={scaleSequential([0, 100], interpolateViridis)} title="Temperature (°F)" />

		<Legend
			scale={scaleSequential([0, 100], interpolateViridis)}
			title="Temperature (°F)"
			variant="swatches"
		/>
	</div>
	```
-->
