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

<div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 mb-2 lc-example-controls">
	<Field label="Tweened" let:id>
		<Switch bind:checked={tweened} {id} size="md" />
	</Field>
	<PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
	<CurveMenuField bind:value={curve} />
	<RangeField label="Points" bind:value={pointCount} min={2} />
</div>

<div class="grid gap-2">
	<div>default (auto)</div>
	<Chart {data} x="x" y="y" height={200}>
		<Layer>
			<Spline
				{curve}
				class="stroke-primary stroke-2"
				marker={{ type: 'line', class: 'stroke-2 stroke-accent' }}
				motion={tweened ? 'tween' : 'none'}
			/>
		</Layer>
	</Chart>

	<div>0</div>
	<Chart {data} x="x" y="y" height={200}>
		<Layer>
			<Spline
				{curve}
				class="stroke-primary stroke-2"
				marker={{ type: 'line', orient: 0, class: 'stroke-2 stroke-accent' }}
				motion={tweened ? 'tween' : 'none'}
			/>
		</Layer>
	</Chart>

	<div>90</div>
	<Chart {data} x="x" y="y" height={200}>
		<Layer>
			<Spline
				{curve}
				class="stroke-primary stroke-2"
				marker={{ type: 'line', orient: 90, class: 'stroke-2 stroke-accent' }}
				motion={tweened ? 'tween' : 'none'}
			/>
		</Layer>
	</Chart>
</div>
