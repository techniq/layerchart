<script lang="ts">
	import { SelectField } from 'svelte-ux';

	interface Props {
		projections: Array<{ label: string; value: any }>;
		projection?: any;
	}

	let { projections, projection = $bindable() }: Props = $props();
</script>

<div class="grid grid-cols-[1fr_2fr] gap-2 mb-4 screeenshot-hidden">
	<SelectField
		label="Projections"
		options={projections}
		bind:value={projection}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
</div>
