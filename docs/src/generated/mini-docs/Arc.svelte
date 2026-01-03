
<!--
	@component
	## Arc

	## Description

	Primitive component which draws a curved segment on a chart to represent portions of a whole or highlight specific data ranges.

	## Category

	[[Primitives](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Primitives.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [Arc](/docs/components/Arc)

	## API Properties

	* value:<number> - undefined 
	* initialValue:<number> - undefined 
	* domain:<[ number, number ]>=[0, 100]; - Domain [min,max] in degrees 
	* range:<[ number, number ]>=[0, 360] - Range [min,max] in degrees. See also startAngle/endAngle 
	* startAngle:<number> - Start angle in radians 
	* endAngle:<number> - End angle in radians 
	* innerRadius:<number> - Define innerRadius. Defaults to yRange min
  • value >= 1: discrete value
  • value < 1: percent of `outerRadius`
  • value < 0: offset of `outerRadius` 
	* outerRadius:<number> - Define outerRadius. Defaults to smallest width (xRange) or height (yRange) dimension (/2)
  • value >= 1: discrete value
  • value < 1: percent of chart width or height (smallest) / 2
  • value < 0: offset of chart width or height (smallest) / 2 
	* cornerRadius:<number>=0 - Corner radius of the arc 
	* padAngle:<number>=0 - Angle between the arcs 
	* trackStartAngle:<number> - Start angle in radians 
	* trackEndAngle:<number> - End angle in radians 
	* trackInnerRadius:<number> - Define innerRadius. Defaults to yRange min
  • value >= 1: discrete value
  • value < 1: percent of `outerRadius`
  • value < 0: offset of `outerRadius` 
	* trackOuterRadius:<number> - Define outerRadius. Defaults to smallest width (xRange) or height (yRange) dimension (/2)
  • value >= 1: discrete value
  • value < 1: percent of chart width or height (smallest) / 2
  • value < 0: offset of chart width or height (smallest) / 2 
	* trackCornerRadius:<number>=0 - Corner radius of the arc 
	* trackPadAngle:<number>=0 - Angle between the arcs 
	* offset:<number>=0 - Offset arc from center 
	* tooltipContext:<TooltipContextValue> - Tooltip context to setup pointer events to show tooltip for related data.

**Must set `data` prop as well** 
	* data:<any> - Data to set when showing tooltip 
	* track:<boolean | Partial<ComponentProps<typeof Path>>> - Pass true to enable the track with default props, or pass an object
of props to enable the track. 
	* trackRef:<SVGPathElement> - A reference to the track element 
	* ref:<SVGPathElement> - A reference to the arc element 
	* children:<Snippet<[ { centroid: [ number, number ]; boundingBox: DOMRect; value: number; getTrackTextProps: GetArcTextProps; getArcTextProps: GetArcTextProps; } ]>> - undefined 
	* motion:<MotionProp> - undefined 
	* fill:<string> - Fill color 
	* fillOpacity:<number> - Fill opacity (0-1) 
	* stroke:<string> - Stroke color 
	* strokeWidth:<number> - Stroke width in pixels 
	* strokeOpacity:<number> - Stroke opacity (0-1) 
	* opacity:<number> - Overall opacity (0-1) 

	## Related

	[Pie](/docs/components/Pie)
	[ArcChart](/docs/components/ArcChart)
	[PieChart](/docs/components/PieChart)

	@example
	```svelte
	<script lang="ts">
		import { Arc, Chart, Group, Layer, LinearGradient, Text } from 'layerchart';
		import ArcControls from '$lib/components/controls/ArcControls.svelte';

		let value = $state(75);

		export { value as data };
	</script>

	<ArcControls bind:value />

	<Chart height={120} padding={20}>
		<Layer center>
			<Group y={16}>
				<LinearGradient class="from-secondary to-primary">
					{#snippet children({ gradient })}
						<Arc
							{value}
							range={[-120, 120]}
							outerRadius={60}
							innerRadius={50}
							cornerRadius={5}
							motion="spring"
							fill={gradient}
							track={{ class: 'fill-none stroke-surface-content/10' }}
						>
							{#snippet children({ value })}
								<Text
									value={Math.round(value) + '%'}
									textAnchor="middle"
									verticalAnchor="middle"
									class="text-3xl tabular-nums"
								/>
							{/snippet}
						</Arc>
					{/snippet}
				</LinearGradient>
			</Group>
		</Layer>
	</Chart>
	```
-->
