<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Chart, Spline, Layer } from 'layerchart';
	import { Field, RangeField, Switch } from 'svelte-ux';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';
	import PathDataMenuField from '$lib/components/PathDataMenuField.svelte';

	let pathGenerator = $state((x: number) => x);
	let curve: ComponentProps<typeof CurveMenuField>['value'] = $state(undefined);

	let pointCount = $state(10);
	let amplitude = $state(1);
	let frequency = $state(10);
	let phase = $state(0);

	let markerStart = $state(true);
	let markerMid = $state(false);
	let markerEnd = $state(true);

	let tweened = $state(true);
	const motion = $derived(tweened ? 'tween' : 'none');

	const data = $derived(
		Array.from({ length: pointCount }).map((_, i) => {
			return {
				x: i + 1,
				y: pathGenerator(i / pointCount) ?? i
			};
		})
	);
	export { data };

	const markerTypes = ['arrow', 'triangle', 'dot', 'circle', 'circle-stroke', 'line'] as const;
</script>

<div class="grid grid-cols-[auto_auto_auto_auto_1fr_1fr_1fr] gap-2 mb-2 lc-example-controls">
	<Field label="Start" let:id>
		<Switch bind:checked={markerStart} {id} size="md" />
	</Field>
	<Field label="Mid" let:id>
		<Switch bind:checked={markerMid} {id} size="md" />
	</Field>
	<Field label="End" let:id>
		<Switch bind:checked={markerEnd} {id} size="md" />
	</Field>
	<Field label="Tweened" let:id>
		<Switch bind:checked={tweened} {id} size="md" />
	</Field>
	<PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
	<CurveMenuField bind:value={curve} />
	<RangeField label="Points" bind:value={pointCount} min={2} />
</div>

<div class="grid gap-2">
	{#each markerTypes as marker}
		<div>{marker}</div>
		<Chart {data} x="x" y="y" height={100}>
			<Layer>
				<Spline
					{curve}
					class="stroke-primary"
					markerStart={markerStart ? marker : undefined}
					markerMid={markerMid ? marker : undefined}
					markerEnd={markerEnd ? marker : undefined}
					{motion}
				/>
			</Layer>
		</Chart>
	{/each}
</div>
