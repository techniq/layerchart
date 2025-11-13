<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { cubicOut } from 'svelte/easing';

	import { Chart, Circle, Layer, Points, Spline } from 'layerchart';
	import TransformContextControls from '$lib/components/TransformContextControls.svelte';
	import TransformControls from '$lib/components/TransformControls.svelte';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';

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

<TransformContextControls bind:config />
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
	<TransformControls />
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
