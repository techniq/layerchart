
<!--
	@component
	## Hull

	## Description

	Marking component which encloses a set of data points within a convex boundary to highlight clusters or groupings on a chart.

	## Category

	[[Marks](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Marks.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [Hull](/docs/components/Hull)

	## API Properties

	* data:<any> - Override data instead of using context 
	* curve:<ComponentProps<typeof Spline>['curve']>=curveLinearClosed - The curve factory to use for the hull 
	* classes:<{ root?: string; path?: string; }> - Classes to apply to the elements. 
	* onpointermove:<(e: PointerEvent, details: { points: [ number, number ][]; polygon: Delaunay.Polygon; }) => void> - undefined 
	* onclick:<(e: MouseEvent, details: { points: [ number, number ][]; polygon: Delaunay.Polygon; }) => void> - undefined 
	* onpointerleave:<(e: PointerEvent) => void> - undefined 
	* ref:<SVGGElement> - A bindable reference to the wrapping `<g>` element. 

	## Related

	[](/docs/components/)

	@example
	```svelte
	<script lang="ts">
		import { group } from 'd3-array';
		import { scaleOrdinal } from 'd3-scale';
		import { curveLinearClosed } from 'd3-shape';
		import { Axis, Chart, Hull, Layer, Points } from 'layerchart';
		import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
		import { getGroupData } from '$lib/data.remote';

		let data = $state(await getGroupData());
		let curve = $state(curveLinearClosed);

		const groupColor = scaleOrdinal([
			'var(--color-info)',
			'var(--color-warning)',
			'var(--color-danger)'
		]);
	</script>

	<CurveMenuField bind:value={curve} showOpenClosed />

	<Chart
		{data}
		x="x"
		xNice
		xPadding={[10, 10]}
		y="y"
		yPadding={[10, 10]}
		yNice
		padding={20}
		height={300}
	>
		{@const dataByGroup = group(data, (d: any) => d.group)}
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />
			{#each dataByGroup as [group, data]}
				{@const color = groupColor(group)}
				<Points r={3} {data} fill={color} />
				<!-- TODO: handle group color differently to work with Canvas -->
				<Hull
					{data}
					{curve}
					style="--group-color:{color}"
					classes={{
						path: 'pointer-events-none stroke-[var(--group-color)] fill-[var(--group-color)] [fill-opacity:0.1]'
					}}
				/>
			{/each}
		</Layer>
	</Chart>
	```
-->
