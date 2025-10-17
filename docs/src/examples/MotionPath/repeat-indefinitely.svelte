<script lang="ts">
	import type { ComponentProps } from 'svelte';

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
</script>

<Toggle on let:on={show} let:toggle>
	<div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 mb-2">
		<Field label="Show" let:id>
			<Switch checked={show} on:change={toggle} {id} size="md" />
		</Field>
		<PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
		<CurveMenuField bind:value={curve} />
		<RangeField label="Points" bind:value={pointCount} min={2} />
	</div>

	<div class="h-[300px] p-4 border rounded-sm">
		<Chart {data} x="x" y="y" yNice padding={{ left: 16, bottom: 24 }} height={400}>
			<Layer>
				<Axis placement="left" grid rule />
				<Axis placement="bottom" rule />
				{#if show}
					<MotionPath duration="3s" repeatCount="indefinite">
						{#snippet children({ pathId, objectId })}
							<Spline id={pathId} {curve} />
							<Circle id={objectId} r={5} class="fill-surface-100 stroke-surface-content" />
						{/snippet}
					</MotionPath>
				{/if}
			</Layer>
		</Chart>
	</div>
</Toggle>
