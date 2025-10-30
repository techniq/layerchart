<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Field, RangeField, Switch } from 'svelte-ux';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';
	import PathDataMenuField from '$lib/components/PathDataMenuField.svelte';

	// <MotionPathControls bind:show bind:pathGenerator bind:amplitude bind:frequency bind:phase bind:curve bind:pointCount />

	interface Props {
		show?: boolean;
		pathGenerator?: (x: number) => number;
		amplitude?: number;
		frequency?: number;
		phase?: number;
		curve?: ComponentProps<typeof CurveMenuField>['value'];
		pointCount?: number;
	}

	let {
		show = $bindable(true),
		pathGenerator = $bindable((x: number) => x),
		amplitude = $bindable(1),
		frequency = $bindable(10),
		phase = $bindable(0),
		curve = $bindable(undefined),
		pointCount = $bindable(100)
	}: Props = $props();
</script>

<div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 mb-4">
	<Field label="Show" let:id>
		<Switch bind:checked={show} {id} size="md" />
	</Field>
	<PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
	<CurveMenuField bind:value={curve} />
	<RangeField label="Points" bind:value={pointCount} min={2} />
</div>
