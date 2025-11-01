<script lang="ts">
	import { Field, RangeField, Switch, TextField } from 'svelte-ux';

	// <ForceTextControls bind:text bind:fontSize bind:spacing bind:radius bind:hasCollideForce bind:hasChargeForce />

	interface Props {
		text?: string;
		fontSize?: number;
		spacing?: number;
		radius?: number;
		hasCollideForce?: boolean;
		hasChargeForce?: boolean;
	}

	let {
		text = $bindable('LayerChart'),
		fontSize = $bindable(124),
		spacing = $bindable(10),
		radius = $bindable(2),
		hasCollideForce = $bindable(true),
		hasChargeForce = $bindable(false)
	}: Props = $props();
</script>

<div class="grid grid-flow-col gap-2 mb-1">
	<TextField label="Text" bind:value={text} />
	<RangeField label="Font size (px)" bind:value={fontSize} max={600} />
	<RangeField label="Spacing" bind:value={spacing} />
	<RangeField label="Radius" bind:value={radius} min={1} max={spacing * 2} />
</div>
<div class="flex gap-2 mb-2">
	<Field label="Collide Force" let:id>
		<Switch bind:checked={hasCollideForce} {id} size="md" />
	</Field>
	<Field label="Charge Force" let:id>
		<Switch bind:checked={hasChargeForce} {id} size="md" />
	</Field>
	<!-- <Field label="Transition" let:id>
    <Switch bind:checked={transition} {id} size="md" />
  </Field> -->
</div>
