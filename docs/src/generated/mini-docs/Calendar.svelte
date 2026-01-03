
<!--
	@component
	## Calendar

	## Description

	Marking component which highlights specific dates or time periods on a chart to emphasize events, milestones, or temporal patterns.

	## Category

	[[Marks](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Marks.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas), [HTML](/docs/components/html)

	Full Documentation: [Calendar](/docs/components/Calendar)

	## API Properties

	* start:<Date> - The start date of the calendar.  (REQUIRED)
	* end:<Date> - The end date of the calendar.  (REQUIRED)
	* cellSize:<number | [ number, number ]> - Size of the cell in the calendar.

- `number`: sets width/height as same value (square).
- `array`: sets as [width,height].
- `undefined/omitted`: is derived from Chart width/height 
	* monthPath:<boolean | Partial<ComponentProps<typeof MonthPath>>>=false - Enable drawing path around each month.  If object, pass as props to underlying <path> 
	* monthLabel:<boolean | Partial<ComponentProps<typeof Text>>> - Props to pass to the `<text>` element for month labels. 
	* tooltipContext:<TooltipContextValue> - Tooltip context to setup mouse events to show tooltip for related data 
	* children:<Snippet<[ { cells: CalendarCell[]; cellSize: [ number, number ]; } ]>> - undefined 

	## Related

	[](/docs/components/)

	@example
	```svelte
	<script lang="ts">
		import { scaleThreshold } from 'd3-scale';
		import { timeYear } from 'd3-time';
		import { Calendar, Chart, Layer } from 'layerchart';
		import { createDateSeries } from '$lib/utils/data.js';
		import { endOfInterval } from '@layerstack/utils';

		const now = new Date();
		const firstDayOfYear = timeYear.floor(now);
		const lastDayOfYear = endOfInterval('year', now);

		const data = createDateSeries({ count: 365 * 4, min: 10, max: 100, value: 'integer' }).map(
			(d) => {
				return {
					...d,
					value: Math.random() > 0.2 ? d.value : null // set null for some values
				};
			}
		);
	</script>

	<Chart
		{data}
		x="date"
		c="value"
		cScale={scaleThreshold().unknown('transparent')}
		cDomain={[25, 50, 75]}
		cRange={[
			'var(--color-primary-100)',
			'var(--color-primary-300)',
			'var(--color-primary-500)',
			'var(--color-primary-700)'
		]}
		padding={{ top: 20 }}
		height={140}
	>
		<Layer>
			<Calendar start={firstDayOfYear} end={lastDayOfYear} monthPath />
		</Layer>
	</Chart>
	```
-->
