<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Axis, Chart, Layer, Spline, Points } from 'layerchart';
	import { Field, RangeField, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';
	import PathDataMenuField from '$lib/components/PathDataMenuField.svelte';

	let show = $state(true);
	let showPoints = $state(false);
	let pointCount = $state(100);
	let pathGenerator = $state((x: number) => x);
	let curve: ComponentProps<typeof CurveMenuField>['value'] = $state(undefined);
	let amplitude = $state(1);
	let frequency = $state(10);
	let phase = $state(0);
	let motion: 'draw' | 'tween' | 'none' = $state('tween');

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
	<Field label="Show points" let:id>
		<Switch bind:checked={showPoints} {id} size="md" />
	</Field>
	<Field label="Motion" classes={{ input: 'mt-1 mb-[6px]' }}>
		<ToggleGroup bind:value={motion} variant="outline" size="sm">
			<ToggleOption value="tween">tween</ToggleOption>
			<ToggleOption value="draw">draw</ToggleOption>
			<ToggleOption value="none">none</ToggleOption>
		</ToggleGroup>
	</Field>
</div>
<Chart {data} x="x" y="y" yNice padding={{ left: 16, bottom: 24 }} height={300}>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		{#if show}
			<Spline
				{curve}
				motion={motion === 'tween' ? 'tween' : 'none'}
				draw={motion === 'draw'}
				class="stroke-primary stroke-2"
			/>
		{/if}
		{#if showPoints}
			<Points
				motion={motion === 'tween' ? 'tween' : 'none'}
				r={3}
				class="fill-surface-100 stroke-primary"
			/>
		{/if}
	</Layer>
</Chart>
