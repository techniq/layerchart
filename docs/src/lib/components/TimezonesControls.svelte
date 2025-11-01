<script lang="ts">
	import { Field, SelectField, Switch } from 'svelte-ux';

	// <TimezonesControls {projections} bind:projection bind:enableClip bind:showDaylight />

	interface Props {
		projections: Array<{ label: string; value: any }>;
		projection?: any;
		enableClip?: boolean;
		showDaylight?: boolean;
	}

	let {
		projections,
		projection = $bindable(),
		enableClip = $bindable(false),
		showDaylight = $bindable(false)
	}: Props = $props();
</script>

<div class="grid grid-cols-[1fr_auto_auto_2fr] gap-2 my-2">
	<SelectField
		label="Projections"
		options={projections}
		bind:value={projection}
		clearable={false}
		toggleIcon={null}
		stepper
	/>

	<Field label="Clip" let:id>
		<Switch bind:checked={enableClip} {id} size="md" />
	</Field>

	<Field label="Daylight" let:id>
		<Switch bind:checked={showDaylight} {id} size="md" />
	</Field>
</div>
