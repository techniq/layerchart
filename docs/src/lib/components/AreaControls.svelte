<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Field, RangeField, Switch } from 'svelte-ux';
	import PathDataMenuField from '$lib/components/PathDataMenuField.svelte';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';

	// <AreaControls bind:pathGenerator bind:curve bind:pointCount bind:showPoints bind:showLine bind:show bind:tweened />

	interface Props {
		pathGenerator?: (x: number) => number;
		curve?: ComponentProps<typeof CurveMenuField>['value'];
		pointCount?: number;
		showPoints?: boolean;
		showLine?: boolean;
		show?: boolean;
		tweened?: boolean;
	}

	let {
		pathGenerator = $bindable((x: number) => x),
		curve = $bindable(undefined),
		pointCount = $bindable(10),
		showPoints = $bindable(false),
		showLine = $bindable(true),
		show = $bindable(true),
		tweened = $bindable(true)
	}: Props = $props();
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
