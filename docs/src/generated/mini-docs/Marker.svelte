
<!--
	@component
	## Marker

	## Description

	Primitive component which draws visual symbols like circles, squares, or custom shapes at individual data points.

	## Category

	[[Primitives](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Primitives.md)]

	## Layers

	[SVG](/docs/components/svg)

	Full Documentation: [Marker](/docs/components/Marker)

	## API Properties

	* type:<'arrow' | 'triangle' | 'line' | 'circle' | 'circle-stroke' | 'dot'> - The type of marker to render (e.g., arrow, triangle, etc.)

Pass `children` to render a custom element/component inside the marker instead. 
	* id:<string> - Unique identifier for the marker 
	* size:<number>=10 - Size of the marker
(used as default for width and height if not overridden) 
	* markerWidth:<string | number>=size - Width of the marker (can be a string or number) 
	* markerHeight:<string | number>=size - Height of the marker (can be a string or number) 
	* markerUnits:<'userSpaceOnUse' | 'strokeWidth'>='userSpaceOnUse' - Units for marker dimensions ('userSpaceOnUse' or 'strokeWidth') 
	* orient:<'auto' | 'auto-start-reverse' | number>='auto-start-reverse' - Orientation of the marker
('auto', 'auto-start-reverse', or a specific angle in degrees) 
	* refX:<string | number>=9 if type is 'arrow' or 'triangle', otherwise 5 - X-coordinate offset of the marker's reference point 
	* refY:<string | number>=5 - Y-coordinate offset of the marker's reference point 
	* viewBox:<string>='0 0 10 10' - Viewbox defining the coordinate system for the marker (e.g., '0 0 10 10') 

	## Related

	[Spline](/docs/components/Spline)
	[Line](/docs/components/Line)
	[Rule](/docs/components/Rule)
	[GeoSpline](/docs/components/GeoSpline)

	@example
	```svelte
	<script lang="ts">
		import type { ComponentProps } from 'svelte';
		import { Chart, Spline, Layer } from 'layerchart';
		import MarkerControls from '$lib/components/controls/MarkerControls.svelte';
		import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

		let config = $state({
			show: true,
			markerStart: true,
			markerEnd: true,
			tweened: true,
			pathGenerator: (x: number) => x,
			curve: undefined as ComponentProps<typeof CurveMenuField>['value'],
			pointCount: 10,
			amplitude: 1,
			frequency: 10,
			phase: 0
		});

		const markerTypes = ['arrow', 'triangle', 'dot', 'circle', 'circle-stroke', 'line'] as const;

		const motion = $derived(config.tweened ? 'tween' : 'none');
		const data = $derived(
			Array.from({ length: config.pointCount }).map((_, i) => {
				return {
					x: i + 1,
					y: config.pathGenerator(i / config.pointCount) ?? i
				};
			})
		);
	</script>

	<MarkerControls bind:config />

	<div class="grid gap-2">
		{#each markerTypes as marker}
			<div>{marker}</div>
			<Chart {data} x="x" y="y" height={100}>
				<Layer>
					{#if config.show}
						<Spline
							curve={config.curve}
							class="stroke-primary"
							markerStart={config.markerStart ? marker : undefined}
							markerEnd={config.markerEnd ? marker : undefined}
							{motion}
						/>
					{/if}
				</Layer>
			</Chart>
		{/each}
	</div>
	```
-->
