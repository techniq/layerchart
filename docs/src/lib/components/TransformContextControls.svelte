<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Field, RangeField, Switch } from 'svelte-ux';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';

	// <TransformContextControls bind:angle bind:tweened bind:pointCount bind:curve bind:showPoints bind:showPath />

	interface Props {
		angle?: number;
		tweened?: boolean;
		pointCount?: number;
		curve?: ComponentProps<typeof CurveMenuField>['value'];
		showPoints?: boolean;
		showPath?: boolean;
	}

	let {
		angle = $bindable(137.5),
		tweened = $bindable(true),
		pointCount = $bindable(500),
		curve = $bindable(undefined),
		showPoints = $bindable(true),
		showPath = $bindable(false)
	}: Props = $props();
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
