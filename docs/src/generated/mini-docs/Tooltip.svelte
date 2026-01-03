
<!--
	@component
	## Tooltip

	## Description

	Interaction component manages and displays tooltips allowing dynamic information to appear in response to user interactions.

	## Category

	[[Interactions](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Interactions.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [Tooltip](/docs/components/Tooltip)

	## API Properties

	* x:<'pointer' | 'data' | number>='pointer' - `x` position of tooltip.  By default uses the pointer/mouse, can also snap to data or an
explicit fixed position. 
	* y:<'pointer' | 'data' | number>='pointer' - `y` position of tooltip.  By default uses the pointer/mouse, can also snap to data or an
explicit fixed position. 
	* xOffset:<number>=x === 'pointer' ? 10 : 0 - Offset added to `x` position 
	* yOffset:<number>=y === 'pointer' ? 10 : 0 - Offset added to `y` position 
	* anchor:<Placement>='top-left' - Align based on edge of tooltip 
	* motion:<MotionProp>="spring" - The default motion state of the tooltip. 
	* pointerEvents:<boolean>=false - Allow pointer events.  Disabled by default to reduce accidental selection, but useful to
enable to allow interactive tooltips (using `locked`) 
	* contained:<'container' | 'window' | false>='container' - Include padding area (ex. axis) 
	* variant:<'default' | 'invert' | 'none'>='default' - Tooltip variant 
	* classes:<{ root?: string; container?: string; content?: string; header?: string; }>={} - Classes to apply to the various elements of the tooltip. 
	* children:<Snippet<[ { data: T; payload: TooltipPayload[]; } ]>> - undefined 
	* rootRef:<HTMLElement> - A reference to the tooltip's outermost `<div>` tag. 
	* props:<{ root?: HTMLAttributes<HTMLElement>; container?: HTMLAttributes<HTMLElement>; content?: HTMLAttributes<HTMLElement>; }> - Props to pass to the underlying elements rendered
by the Tooltip component 
	* context:<ChartContextValue<T, any, any>> - Optionally pass the chart's context to the tooltip to get
type inference for the data. 

	## Related

	[TooltipContext](/docs/components/TooltipContext)
	[Highlight](/docs/components/Highlight)

	@example
	```svelte
	<script lang="ts">
		import { Area, Axis, Chart, Layer, Highlight, Tooltip, defaultChartPadding } from 'layerchart';
		import { createDateSeries } from '$lib/utils/data.js';

		const data = createDateSeries({
			count: 30,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});
	</script>

	<Chart
		{data}
		x="date"
		y="value"
		yDomain={[0, null]}
		yNice
		padding={defaultChartPadding({ top: 5, left: 28, bottom: 24, right: 15 })}
		tooltip={{ mode: 'quadtree-x' }}
		height={300}
	>
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />
			<Area class="fill-primary/30" line={{ class: 'stroke-primary stroke-2' }} />
			<Highlight points lines />
		</Layer>
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header value={data.date} format="day" />
				<Tooltip.List>
					<Tooltip.Item label="value" value={data.value} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	</Chart>
	```
-->
