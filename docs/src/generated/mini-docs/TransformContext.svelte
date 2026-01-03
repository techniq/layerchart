
<!--
	@component
	## TransformContext

	## Description

	Interaction component which provides context to support panning, zooming, and dragging interactions for chart elements.

	## Category

	[[Interactions](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Interactions.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas), [HTML](/docs/components/html)

	Full Documentation: [TransformContext](/docs/components/TransformContext)

	## API Properties

	* mode:<TransformMode> - undefined 
	* processTranslate:<(x: number, y: number, deltaX: number, deltaY: number) => { x: number; y: number; }> - undefined 
	* disablePointer:<boolean>=false - Disable pointer events including move/dragging.  Useful for `mode="canvas" but only want
zoomTo() interactions 
	* transformContext:<TransformContextValue> - A bindable reference to the transform context value. 
	* initialScrollMode:<TransformScrollMode>='none' - Initial scroll mode.
This is set to `none` by default, but can be set to `scale` or `translate` 
	* clickDistance:<number>=10 - Distance/threshold to consider drag vs click (disable click propagation) 
	* initialTranslate:<{ x: number; y: number; }> - Initial translate value 
	* initialScale:<number> - Initial scale value 
	* onTransform:<(details: { scale: number; translate: { x: number; y: number; }; }) => void> - A callback function that is called when the transform is applied. 
	* ondragstart:<() => void> - undefined 
	* ondragend:<() => void> - undefined 
	* ref:<HTMLElement> - undefined 
	* children:<Snippet<[ { transformContext: TransformContextValue; } ]>> - undefined 
	* motion:<MotionProp> - undefined 

	## Related

	[Chart](/docs/components/Chart)
	[Pack/basic](/docs/components/Pack/basic)
	[Tree/basic](/docs/components/Tree/basic)
	[GeoPath/transform-canvas](/docs/components/GeoPath/transform-canvas)
	[GeoPath/transform-projection](/docs/components/GeoPath/transform-projection)
	[GeoTile/zoomable](/docs/components/GeoTile/zoomable)
	[GeoSpline/draggable-globe](/docs/components/GeoSpline/draggable-globe)

	@example
	```svelte
	<script lang="ts">
		import type { ComponentProps } from 'svelte';
		import { cubicOut } from 'svelte/easing';

		import { Chart, Circle, Layer, Points, Spline } from 'layerchart';
		import TransformContextPlaygroundControls from '$lib/components/controls/TransformContextPlaygroundControls.svelte';
		import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
		import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

		import { getSpiral } from '$lib/utils/data';

		let config = $state({
			pointCount: 500,
			angle: 137.5,
			showPoints: true,
			showPath: false,
			tweened: true,
			curve: undefined as ComponentProps<typeof CurveMenuField>['value']
		});

		const data = $derived(
			getSpiral({
				angle: config.angle,
				radius: 10,
				count: config.pointCount,
				width: 500,
				height: 500
			})
		);
	</script>

	<TransformContextPlaygroundControls bind:config />

	<div class="grid place-items-center">
		<Chart
			{data}
			x="x"
			y="y"
			transform={{
				mode: 'canvas',
				motion: config.tweened ? { type: 'tween', duration: 800, easing: cubicOut } : undefined,
				initialScrollMode: 'scale'
			}}
			padding={50}
			width={500}
			height={500}
		>
			<TransformContextControls />
			<Layer class="overflow-hidden">
				{#if config.showPath}
					<Spline curve={config.curve} motion="tween" />
				{/if}
				{#if config.showPoints}
					<Points>
						{#snippet children({ points })}
							{#each points as point, index}
								<Circle
									cx={point.x}
									cy={point.y}
									r={2}
									class={index % 2 ? 'fill-primary' : 'fill-secondary'}
									motion={config.tweened ? 'tween' : undefined}
								/>
							{/each}
						{/snippet}
					</Points>
				{/if}
			</Layer>
		</Chart>
	</div>
	```
-->
