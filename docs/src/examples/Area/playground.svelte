<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Field, RangeField, Switch } from 'svelte-ux';
	import { Area, Axis, Chart, Points, Layer } from 'layerchart';
	import PathDataMenuField from '$lib/components/PathDataMenuField.svelte';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';

	let pointCount = $state(10);
	let showPoints = $state(false);
	let showLine = $state(true);
	let show = $state(true);
	let tweened = $state(true);
	const motion = $derived(tweened ? 'tween' : 'none');

	let pathGenerator = $state((x: number) => x);
	let curve: ComponentProps<typeof CurveMenuField>['value'] = $state(undefined);

	const data = $derived(
		Array.from({ length: pointCount }).map((_, i) => {
			return {
				x: i + 1,
				y: pathGenerator?.(i / pointCount) ?? i
			};
		})
	);

	export { data };
</script>

<div class="grid gap-2 mb-4">
	<div class="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-2">
		<PathDataMenuField bind:value={pathGenerator} />
		<CurveMenuField bind:value={curve} />
		<RangeField label="Points" bind:value={pointCount} min={2} />
		<Field label="Show points" let:id>
			<Switch bind:checked={showPoints} {id} size="md" />
		</Field>
		<Field label="Show Line" let:id>
			<Switch bind:checked={showLine} {id} size="md" />
		</Field>
	</div>

	<div class="grid grid-cols-[100px_auto_1fr] gap-2">
		<Field label="Show" let:id>
			<Switch bind:checked={show} {id} size="md" />
		</Field>

		<Field label="Tweened" let:id>
			<Switch bind:checked={tweened} {id} size="md" />
		</Field>
	</div>
</div>

<Chart {data} x="x" y="y" yNice padding={{ left: 20, right: 8, top: 4, bottom: 24 }} height={300}>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		{#if show}
			<Area
				{curve}
				line={showLine && { class: 'stroke-primary stroke-2' }}
				{motion}
				class="fill-primary/10"
			/>

			{#if showPoints}
				<Points {motion} r={3} class="fill-surface-100 stroke-primary" />
			{/if}
		{/if}
	</Layer>
</Chart>
