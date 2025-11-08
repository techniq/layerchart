<script lang="ts">
	import { SelectField } from 'svelte-ux';

	// <ZoomableMapControls {projections} bind:projection />

	interface Props {
		projections: Array<{ label: string; value: any }>;
		projection?: any;
	}

	let { projections, projection = $bindable() }: Props = $props();
</script>

<div class="grid grid-cols-[1fr_2fr] gap-2 my-2 lc-example-controls">
	<SelectField
		label="Projections"
		options={projections}
		bind:value={projection}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
</div>
