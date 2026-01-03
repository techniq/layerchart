
<!--
	@component
	## Pie

	## Description

	Marking component which represents data as proportional slices of a circle, showing the relative contribution of each category to the whole.

	## Category

	[[Marks](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Marks.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [Pie](/docs/components/Pie)

	## API Properties

	* data:<any[]> - undefined 
	* range:<[ number, number ] | number[]>=[0, 360] - Range [min,max] in degrees.  See also startAngle/endAngle 
	* startAngle:<number> - Start angle in radians 
	* endAngle:<number> - End angle in radians 
	* innerRadius:<number> - Define innerRadius.
  value >= 1: discrete value
  value >  0: percent of `outerRadius`
  value <  0: offset of `outerRadius`
  default: yRange min 
	* outerRadius:<number> - Define outerRadius.  Defaults to yRange max/2 (ie. chart height / 2) 
	* cornerRadius:<number>=0 - Corner radius of the arc 
	* padAngle:<number>=0 - Angle between the arcs 
	* offset:<number>=0 - Offset all arcs from center 
	* tooltipContext:<TooltipContextValue> - Tooltip context to setup pointer events to show tooltip for related data 
	* sort:<((a: any, b: any) => number) | null> - Sort function to sort the arcs 
	* children:<Snippet<[ { arcs: PieArcDatum<any>[]; } ]>> - undefined 
	* motion:<MotionProp> - undefined 

	## Related

	[Arc](/docs/components/Arc)
	[PieChart](/docs/components/PieChart)

	@example
	```svelte
	<script lang="ts">
		import { Chart, Layer, Pie } from 'layerchart';

		// fixed data (same as disable-sorting example to call attention to what sorting does)
		const data = [
			{
				date: '2025-11-04T05:00:00.000Z',
				value: 99
			},
			{
				date: '2025-11-06T05:00:00.000Z',
				value: 30
			},
			{
				date: '2025-11-05T05:00:00.000Z',
				value: 14
			},
			{
				date: '2025-11-07T05:00:00.000Z',
				value: 67
			}
		];

		const keyColors = [
			'var(--color-info)',
			'var(--color-success)',
			'var(--color-warning)',
			'var(--color-danger)'
		];
	</script>

	<Chart {data} x="value" c="date" cRange={keyColors} height={300}>
		<Layer center>
			<Pie />
		</Layer>
	</Chart>
	```
-->
