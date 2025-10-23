<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Chart, Spline, Layer } from 'layerchart';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';
	import { Field, RangeField, Switch } from 'svelte-ux';
	import PathDataMenuField from '$lib/components/PathDataMenuField.svelte';

	let pathGenerator = $state((x: number) => x);
	let curve: ComponentProps<typeof CurveMenuField>['value'] = $state(undefined);

	let pointCount = $state(10);
	let amplitude = $state(1);
	let frequency = $state(10);
	let phase = $state(0);
	let tweened = $state(true);

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

<div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 mb-2">
	<Field label="Tweened" let:id>
		<Switch bind:checked={tweened} {id} size="md" />
	</Field>
	<PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
	<CurveMenuField bind:value={curve} />
	<RangeField label="Points" bind:value={pointCount} min={2} />
</div>

<Chart {data} x="x" y="y" height={200}>
	<Layer>
		<Spline
			{curve}
			class="stroke-primary stroke-2"
			markerStart={{ type: 'circle', size: 20, class: 'stroke-2 fill-secondary' }}
			markerMid={{ type: 'line', class: 'stroke-2 stroke-accent' }}
			markerEnd={{
				type: 'triangle',
				size: 20,
				class: 'stroke-2 stroke-surface-100 fill-secondary'
			}}
			motion={tweened ? 'tween' : 'none'}
		/>
	</Layer>
</Chart>
