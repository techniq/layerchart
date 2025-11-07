<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Field, RangeField, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';
	import PathDataMenuField from '$lib/components/PathDataMenuField.svelte';

	// <SplinePlaygroundControls bind:show bind:pathGenerator bind:amplitude bind:frequency bind:phase bind:curve bind:pointCount bind:showPoints bind:motion />

	interface Props {
		show?: boolean;
		pathGenerator?: (x: number) => number;
		amplitude?: number;
		frequency?: number;
		phase?: number;
		curve?: ComponentProps<typeof CurveMenuField>['value'];
		pointCount?: number;
		showPoints?: boolean;
		motion?: 'draw' | 'tween' | 'none';
	}

	let {
		show = $bindable(true),
		pathGenerator = $bindable((x: number) => x),
		amplitude = $bindable(1),
		frequency = $bindable(10),
		phase = $bindable(0),
		curve = $bindable(undefined),
		pointCount = $bindable(100),
		showPoints = $bindable(false),
		motion = $bindable('tween')
	}: Props = $props();
</script>

<div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 mb-6 lc-example-controls">
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
