
<!--
	@component
	## MotionPath

	## Description

	Component animates an object along a specified path using configurable motion parameters such as speed, duration, and easing.

	## Category

	[[Other](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Other.md)]

	## Layers

	[SVG](/docs/components/svg)

	Full Documentation: [MotionPath](/docs/components/MotionPath)

	## API Properties

	* pathId:<string> - Id of path to move object along 
	* objectId:<string> - Id of object to move along path 
	* duration:<string> - Duration of the animation  (REQUIRED)
	* repeatCount:<number | 'indefinite'> - Number of times the animation will occur 
	* fill:<'freeze' | 'remove'>='freeze' - Final state of the animation.  Freeze (last frame) or remove (first frame)
https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill#animate 
	* rotate:<number | 'auto' | 'auto-reverse'> - Rotation applied to the element animated along a path, usually to make it pointing
in the direction of the animation 
	* ref:<SVGAnimateMotionElement> - A bindable reference to the underlying `<animateMotion>` element. 
	* children:<Snippet<[ { pathId: string; objectId: string; } ]>> - undefined 

	## Related

	[Spline](/docs/components/Spline)

	@example
	```svelte
	<script lang="ts">
		import type { ComponentProps } from 'svelte';

		import { Axis, Chart, Layer, MotionPath, Polygon, Spline } from 'layerchart';

		import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
		import MotionPathControls from '$lib/components/controls/MotionPathControls.svelte';

		let config = $state({
			pointCount: 100,
			pathGenerator: (x: number) => x,
			curve: undefined as ComponentProps<typeof CurveMenuField>['value'],
			amplitude: 1,
			frequency: 10,
			phase: 0,
			show: true,
			duration: '5s',
			repeatCount: 'indefinite' as number | 'indefinite',
			start: undefined as string | undefined
		});

		const data = $derived(
			Array.from({ length: config.pointCount }).map((_, i) => {
				return {
					x: i + 1,
					y: config.pathGenerator(i / config.pointCount) ?? i
				};
			})
		);
	</script>

	<MotionPathControls bind:config />

	<Chart {data} x="x" y="y" yNice padding={{ left: 16, bottom: 24 }} height={300}>
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />
			{#if config.show}
				<MotionPath
					duration={config.duration}
					repeatCount={config.repeatCount}
					{...config.start ? { begin: config.start } : {}}
				>
					{#snippet children({ pathId, objectId })}
						<Spline id={pathId} curve={config.curve} />
						<Polygon
							id={objectId}
							r={10}
							points={3}
							class="stroke-surface-content fill-surface-100"
						/>
					{/snippet}
				</MotionPath>
			{/if}
		</Layer>
	</Chart>
	```
-->
