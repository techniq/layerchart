<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { cubicOut } from 'svelte/easing';

	import { Chart, Circle, Layer, Points, Spline } from 'layerchart';
	import { Field, RangeField, Switch } from 'svelte-ux';

	import TransformControls from '$lib/components/TransformControls.svelte';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';
	import { getSpiral } from '$lib/utils/data';

	let pointCount = $state(500);
	let angle = $state(137.5); //
	let showPoints = $state(true);
	let showPath = $state(false);
	let tweened = $state(true);

	const data = $derived(
		getSpiral({ angle, radius: 10, count: pointCount, width: 500, height: 500 })
	);

	let curve: ComponentProps<typeof CurveMenuField>['value'] = $state(undefined);
</script>

<div class="grid grid-cols-[1fr_auto] gap-2 mb-2">
	<RangeField label="Angle" bind:value={angle} min={1} max={360} />
	<Field label="Tweened" let:id>
		<Switch bind:checked={tweened} {id} size="md" />
	</Field>
</div>

<div class="grid grid-cols-[1fr_1fr_auto_auto] gap-2 mb-6">
	<RangeField label="Points" bind:value={pointCount} min={1} max={2000} />
	<CurveMenuField bind:value={curve} showOpenClosed />
	<Field label="Show points" let:id>
		<Switch bind:checked={showPoints} {id} size="md" />
	</Field>
	<Field label="Show path" let:id>
		<Switch bind:checked={showPath} {id} size="md" />
	</Field>
</div>

<Chart
	{data}
	x="x"
	y="y"
	transform={{
		mode: 'canvas',
		motion: tweened ? { type: 'tween', duration: 800, easing: cubicOut } : undefined,
		initialScrollMode: 'scale'
	}}
	padding={40}
	width={500}
	height={500}
>
	<TransformControls />
	<Layer class="border rounded overflow-hidden">
		{#if showPath}
			<Spline {curve} motion="tween" />
		{/if}
		{#if showPoints}
			<Points>
				{#snippet children({ points })}
					{#each points as point, index}
						<Circle
							cx={point.x}
							cy={point.y}
							r={2}
							class={index % 2 ? 'fill-primary' : 'fill-secondary'}
							motion={tweened ? 'tween' : undefined}
						/>
					{/each}
				{/snippet}
			</Points>
		{/if}
	</Layer>
</Chart>
