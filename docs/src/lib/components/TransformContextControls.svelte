<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Field, RangeField, Switch } from 'svelte-ux';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';

	// <TransformContextControls bind:config />

	interface TransformContextConfig {
		pointCount: number;
		angle: number;
		showPoints: boolean;
		showPath: boolean;
		tweened: boolean;
		curve?: ComponentProps<typeof CurveMenuField>['value'];
	}

	interface Props {
		config?: TransformContextConfig;
	}

	let {
		config = $bindable({
			pointCount: 500,
			angle: 137.5,
			showPoints: true,
			showPath: false,
			tweened: true,
			curve: undefined as ComponentProps<typeof CurveMenuField>['value']
		})
	}: Props = $props();
</script>

<div class="grid grid-cols-[1fr_auto] gap-2 mb-2 lc-example-controls">
	<RangeField label="Angle" bind:value={config.angle} min={1} max={360} />
	<Field label="Tweened" let:id>
		<Switch bind:checked={config.tweened} {id} size="md" />
	</Field>
</div>

<div class="grid grid-cols-[1fr_1fr_auto_auto] gap-2 mb-6 lc-example-controls">
	<RangeField label="Points" bind:value={config.pointCount} min={1} max={2000} />
	<CurveMenuField bind:value={config.curve} showOpenClosed />
	<Field label="Show points" let:id>
		<Switch bind:checked={config.showPoints} {id} size="md" />
	</Field>
	<Field label="Show path" let:id>
		<Switch bind:checked={config.showPath} {id} size="md" />
	</Field>
</div>
