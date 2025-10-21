<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Axis, Chart, Layer, Spline } from 'layerchart';
	import { Field, RangeField, Switch } from 'svelte-ux';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';
	import PathDataMenuField from '$lib/components/PathDataMenuField.svelte';

	let show = $state(true);
	let pointCount = $state(100);
	let amplitude = $state(1);
	let frequency = $state(10);
	let phase = $state(0);
	let pathGenerator = $state((x: number) => x);
	let curve: ComponentProps<typeof CurveMenuField>['value'] = $state(undefined);

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
	<Field label="Show" let:id>
		<Switch checked={show} on:change={() => (show = !show)} {id} size="md" />
	</Field>
	<PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
	<CurveMenuField bind:value={curve} />
	<RangeField label="Points" bind:value={pointCount} min={2} />
</div>
<Chart {data} x="x" y="y" yNice padding={{ left: 36, bottom: 24 }} height={300}>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		{#if show}
			<Spline {curve} motion="tween" class="stroke-primary stroke-2" />
		{/if}
	</Layer>
</Chart>
