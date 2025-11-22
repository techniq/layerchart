<script lang="ts">
	import { Field, MenuField, Switch } from 'svelte-ux';

	interface Props {
		selectedGraphValue: string;
		showSettings: boolean;
	}

	let { selectedGraphValue = $bindable(), showSettings = $bindable() }: Props = $props();
</script>

<div class="flex justify-end gap-2 items-end mb-2">
	<MenuField
		label="Graph"
		options={[
			{ label: 'Simple', value: 'simple' },
			{ label: 'Medium', value: 'medium' },
			{ label: 'Large', value: 'large' },
			{ label: 'Les Misérables', value: 'miserables' },
			{ label: 'Generated (simple)', value: 'simple-generated' },
			{ label: 'Generated (complex)', value: 'complex-generated' }
		]}
		bind:value={selectedGraphValue}
		menuIcon=""
		dense
		stepper
		class="w-64"
	/>

	<Field label="Settings" labelPlacement="inset" let:id dense>
		<Switch
			checked={showSettings}
			on:change={() => (showSettings = !showSettings)}
			{id}
			size="md"
		/>
	</Field>
</div>
