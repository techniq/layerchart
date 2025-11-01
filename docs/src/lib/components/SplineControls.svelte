<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Field, RangeField, Switch } from 'svelte-ux';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';
	import PathDataMenuField from '$lib/components/PathDataMenuField.svelte';

	// <SplineControls bind:show bind:pathGenerator bind:amplitude bind:frequency bind:phase bind:curve bind:pointCount includeShow={true} />

	interface Props {
		show?: boolean;
		pathGenerator?: (x: number) => number;
		amplitude?: number;
		frequency?: number;
		phase?: number;
		curve?: ComponentProps<typeof CurveMenuField>['value'];
		pointCount?: number;
		includeShow?: boolean;
	}

	let {
		show = $bindable(true),
		pathGenerator = $bindable((x: number) => x),
		amplitude = $bindable(1),
		frequency = $bindable(10),
		phase = $bindable(0),
		curve = $bindable(undefined),
		pointCount = $bindable(100),
		includeShow = false
	}: Props = $props();
</script>

{#snippet Controls()}
	<PathDataMenuField bind:value={pathGenerator} {amplitude} {frequency} {phase} />
	<CurveMenuField bind:value={curve} />
	<RangeField label="Points" bind:value={pointCount} min={2} />
{/snippet}

{#if includeShow}
	<div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 mb-6">
		<Field label="Show" let:id>
			<Switch checked={show} on:change={() => (show = !show)} {id} size="md" />
		</Field>
		{@render Controls()}
	</div>
{:else}
	<div class="grid grid-cols-[auto_1fr_1fr] gap-2 mb-6">
		{@render Controls()}
	</div>
{/if}
