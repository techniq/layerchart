<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Field, RangeField, Switch } from 'svelte-ux';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';
	import PathDataMenuField from '$lib/components/PathDataMenuField.svelte';

	// <MarkerControls bind:config />

	interface MarkerConfig {
		show: boolean;
		tweened: boolean;
		markerStart: boolean;
		markerMid: boolean;
		markerEnd: boolean;
		pathGenerator: (x: number) => number;
		curve?: ComponentProps<typeof CurveMenuField>['value'];
		pointCount: number;
		amplitude: number;
		frequency: number;
		phase: number;
	}

	interface Props {
		config: MarkerConfig;
	}

	let {
		config = $bindable({
			show: true,
			tweened: true,
			markerStart: true,
			markerMid: false,
			markerEnd: true,
			pathGenerator: (x: number) => x,
			curve: undefined as ComponentProps<typeof CurveMenuField>['value'],
			pointCount: 10,
			amplitude: 1,
			frequency: 10,
			phase: 0
		})
	}: Props = $props();
</script>

<div class="grid grid-cols-[auto_auto_auto_auto_auto_1fr_1fr_1fr] gap-2 mb-2 screenshot-hidden">
	<Field label="Show" let:id>
		<Switch bind:checked={config.show} {id} size="md" />
	</Field>
	<Field label="Tween" let:id>
		<Switch bind:checked={config.tweened} {id} size="md" />
	</Field>
	<Field label="Start" let:id>
		<Switch bind:checked={config.markerStart} {id} size="md" />
	</Field>
	<Field label="Mid" let:id>
		<Switch bind:checked={config.markerMid} {id} size="md" />
	</Field>
	<Field label="End" let:id>
		<Switch bind:checked={config.markerEnd} {id} size="md" />
	</Field>
	<RangeField label="Points" bind:value={config.pointCount} min={2} />
	<PathDataMenuField
		bind:value={config.pathGenerator}
		amplitude={config.amplitude}
		frequency={config.frequency}
		phase={config.phase}
	/>
	<CurveMenuField bind:value={config.curve} />
</div>
