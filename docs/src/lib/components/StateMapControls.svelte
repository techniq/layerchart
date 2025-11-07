<script lang="ts">
	import { SelectField } from 'svelte-ux';

	// <StateMapControls {stateOptions} {projections} bind:selectedStateId bind:projection />

	interface Props {
		stateOptions: Array<{ label: string; value: string }>;
		projections: Array<{ label: string; value: any }>;
		selectedStateId?: string;
		projection?: any;
	}

	let {
		stateOptions,
		projections,
		selectedStateId = $bindable('54'),
		projection = $bindable()
	}: Props = $props();
</script>

<div class="grid grid-cols-[1fr_1fr_1fr] gap-2 my-4 lc-example-controls">
	<SelectField
		label="State"
		options={stateOptions}
		bind:value={selectedStateId}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
	<SelectField
		label="Projections"
		options={projections}
		bind:value={projection}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
</div>
