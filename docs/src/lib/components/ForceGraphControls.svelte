<script lang="ts">
	import { Checkbox, Field, ProgressCircle, RangeField } from 'svelte-ux';

	// <ForceGraphControls bind:config />

	interface ForceGraphConfig {
		isStatic: boolean;
		isStopped: boolean;
		alphaTarget: number;
		alpha: number;
		running: boolean;
		nodeRadius: number;
		nodeStrokeWidth: number;
		linkWidth: number;
		linkOpacity: number;
		hasLinkForce: boolean;
		linkDistance: number;
		hasCenterForce: boolean;
		centerStrength: number;
		hasChargeForce: boolean;
		chargeDistanceMin: number;
		chargeDistanceMax: number;
		chargeStrength: number;
		hasCollideForce: boolean;
		collideRadius: number;
		collideStrength: number;
	}

	interface Props {
		config?: ForceGraphConfig;
	}

	let {
		config = $bindable({
			isStatic: false,
			isStopped: false,
			alphaTarget: 0,
			alpha: 1,
			running: false,
			nodeRadius: 3,
			nodeStrokeWidth: 0,
			linkWidth: 1,
			linkOpacity: 0.5,
			hasLinkForce: true,
			linkDistance: 30,
			hasCenterForce: true,
			centerStrength: 1.0,
			hasChargeForce: true,
			chargeDistanceMin: 1,
			chargeDistanceMax: 1000,
			chargeStrength: -30,
			hasCollideForce: true,
			collideRadius: 3,
			collideStrength: 1
		})
	}: Props = $props();
</script>

<div class="grid gap-1 mb-4 screenshot-hidden">
	<div class="grid grid-cols-7 gap-2">
		<Field label="Type" class="col-span-1">
			<Checkbox size="xs" bind:checked={config.isStatic}>Static</Checkbox>
		</Field>
		<Field label="State" class="col-span-1">
			<Checkbox size="xs" bind:checked={config.isStopped}>Stopped</Checkbox>
		</Field>
		<RangeField
			label="Alpha Target"
			class="col-span-2"
			bind:value={config.alphaTarget}
			min={0}
			max={1}
			step={0.1}
		/>
		<RangeField
			label="Alpha"
			class="col-span-2"
			bind:value={config.alpha}
			min={0}
			max={1}
			step={0.001}
			format="decimal"
		/>
		<Field label="Running" class="col-span-1">
			{#if config.running}
				<ProgressCircle size={15} />
			{/if}
		</Field>
	</div>
	<div class="grid grid-cols-4 gap-2">
		<RangeField
			label="Node Radius"
			class="col-span-1"
			bind:value={config.nodeRadius}
			min={3}
			max={30}
			step={1}
		/>
		<RangeField
			label="Node Stroke Width"
			class="col-span-1"
			bind:value={config.nodeStrokeWidth}
			min={0}
			max={10}
			step={0.5}
		/>
		<RangeField
			label="Link Width"
			class="col-span-1"
			bind:value={config.linkWidth}
			min={1}
			max={10}
			step={0.5}
		/>
		<RangeField
			label="Link Opacity"
			class="col-span-1"
			bind:value={config.linkOpacity}
			min={0.1}
			max={1}
			step={0.1}
		/>
	</div>
	<div class="grid grid-cols-7 gap-2">
		<Field label="Link Force" class="col-span-1">
			<Checkbox size="xs" bind:checked={config.hasLinkForce} />
		</Field>
		<RangeField
			label="Link Distance"
			class="col-span-3"
			bind:value={config.linkDistance}
			min={0}
			max={100}
			step={1}
			disabled={!config.hasLinkForce}
		/>
		<Field label="Center Force" class="col-span-1">
			<Checkbox size="xs" bind:checked={config.hasCenterForce} />
		</Field>
		<RangeField
			label="Center Strength"
			class="col-span-2"
			bind:value={config.centerStrength}
			min={0}
			max={1}
			step={0.1}
		/>
	</div>
	<div class="grid grid-cols-7 gap-2">
		<Field label="Charge Force" class="col-span-1">
			<Checkbox size="xs" bind:checked={config.hasChargeForce} />
		</Field>
		<RangeField
			label="Charge Distance Min"
			class="col-span-2"
			bind:value={config.chargeDistanceMin}
			min={1}
			max={10}
			step={1}
			disabled={!config.hasChargeForce}
		/>
		<RangeField
			label="Charge Distance Max"
			class="col-span-2"
			bind:value={config.chargeDistanceMax}
			min={1}
			max={1000}
			step={10}
			disabled={!config.hasChargeForce}
		/>
		<RangeField
			label="Charge Strength"
			class="col-span-2"
			bind:value={config.chargeStrength}
			min={-100}
			max={10}
			step={1}
			disabled={!config.hasChargeForce}
		/>
	</div>
	<div class="grid grid-cols-7 gap-2">
		<Field label="Collide Force" class="col-span-1">
			<Checkbox size="xs" bind:checked={config.hasCollideForce} />
		</Field>
		<RangeField
			label="Collide Radius"
			class="col-span-3"
			bind:value={config.collideRadius}
			min={0}
			max={30}
			step={1}
		/>
		<RangeField
			label="Collide Strength"
			class="col-span-3"
			bind:value={config.collideStrength}
			min={0}
			max={1}
			step={0.1}
		/>
	</div>
</div>
