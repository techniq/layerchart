<script lang="ts">
	import { Field, RangeField, Switch, TextField } from 'svelte-ux';

	interface ForceTextConfig {
		text: string;
		fontSize: number;
		spacing: number;
		radius: number;
		hasCollideForce: boolean;
		hasChargeForce: boolean;
	}

	interface Props {
		config?: ForceTextConfig;
	}

	let {
		config = $bindable({
			text: 'LayerChart',
			fontSize: 124,
			spacing: 10,
			radius: 2,
			hasCollideForce: true,
			hasChargeForce: false
		})
	}: Props = $props();
</script>

<div class="grid grid-flow-col gap-2 mb-1 screenshot-hidden">
	<TextField label="Text" bind:value={config.text} />
	<RangeField label="Font size (px)" bind:value={config.fontSize} max={600} />
	<RangeField label="Spacing" bind:value={config.spacing} />
	<RangeField label="Radius" bind:value={config.radius} min={1} max={config.spacing * 2} />
</div>
<div class="flex gap-2 mb-2">
	<Field label="Collide Force" let:id>
		<Switch bind:checked={config.hasCollideForce} {id} size="md" />
	</Field>
	<Field label="Charge Force" let:id>
		<Switch bind:checked={config.hasChargeForce} {id} size="md" />
	</Field>
	<!-- <Field label="Transition" let:id>
    <Switch bind:checked={transition} {id} size="md" />
  </Field> -->
</div>
