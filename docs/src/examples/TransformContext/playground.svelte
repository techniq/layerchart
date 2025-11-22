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
