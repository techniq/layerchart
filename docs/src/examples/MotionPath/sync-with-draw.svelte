<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { linear } from 'svelte/easing';

	import { Axis, Chart, Circle, Layer, MotionPath, Spline } from 'layerchart';
	import { Field, RangeField, Switch, Toggle } from 'svelte-ux';

	import CurveMenuField from '$lib/components/CurveMenuField.svelte';
	import PathDataMenuField from '$lib/components/PathDataMenuField.svelte';

	let pointCount = $state(100);

	let pathGenerator = $state((x: number) => x);
	let curve: ComponentProps<typeof CurveMenuField>['value'] = $state(undefined);

	let amplitude = $state(1);
	let frequency = $state(10);
	let phase = $state(0);

	const data = $derived(
		Array.from({ length: pointCount }).map((_, i) => {
			return {
				x: i + 1,
				y: pathGenerator(i / pointCount) ?? i
			};
		})
	);

	export { data };

	let show = $state(true);
</script>

<div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 mb-4">
	<Field label="Show" let:id>
		<Switch bind:checked={show} {id} size="md" />
	</Field>
	<PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
	<CurveMenuField bind:value={curve} />
	<RangeField label="Points" bind:value={pointCount} min={2} />
</div>

<Chart {data} x="x" y="y" yNice padding={{ left: 16, bottom: 24 }} height={300}>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		{#if show}
			{#key data}
				<MotionPath duration="3s">
					{#snippet children({ pathId, objectId })}
						<Spline id={pathId} {curve} draw={{ duration: 3000, easing: linear }} />
						<Circle id={objectId} r={5} class="fill-surface-100 stroke-surface-content" />
					{/snippet}
				</MotionPath>
			{/key}
		{/if}
	</Layer>
</Chart>
