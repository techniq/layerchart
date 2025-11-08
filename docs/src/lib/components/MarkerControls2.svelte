<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Field, RangeField, Switch } from 'svelte-ux';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';
	import PathDataMenuField from '$lib/components/PathDataMenuField.svelte';

	// <MarkerControls2 bind:config />

	interface MarkerConfig2 {
		show: boolean;
		tweened: boolean;
		pathGenerator: (x: number) => number;
		curve?: ComponentProps<typeof CurveMenuField>['value'];
		pointCount: number;
		amplitude: number;
		frequency: number;
		phase: number;
	}

	interface Props {
		config: MarkerConfig2;
	}

	let {
		config = $bindable({
			show: true,
			tweened: true,
			pathGenerator: (x: number) => x,
			curve: undefined as ComponentProps<typeof CurveMenuField>['value'],
			pointCount: 10,
			amplitude: 1,
			frequency: 10,
			phase: 0
		})
	}: Props = $props();
</script>

<div class="grid grid-cols-[auto_auto_1fr_1fr_1fr] gap-2 mb-2">
	<Field label="Show" let:id>
		<Switch bind:checked={config.show} {id} size="md" />
	</Field>
	<Field label="Tweened" let:id>
		<Switch bind:checked={config.tweened} {id} size="md" />
	</Field>
	<PathDataMenuField
		bind:value={config.pathGenerator}
		amplitude={config.amplitude}
		frequency={config.frequency}
		phase={config.phase}
	/>
	<CurveMenuField bind:value={config.curve} />
	<RangeField label="Points" bind:value={config.pointCount} min={2} />
</div>
