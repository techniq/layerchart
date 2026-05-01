<script lang="ts">
	import { Field, Switch } from 'svelte-ux';

	interface Props {
		showSettings: boolean;
	}

	let { showSettings = $bindable() }: Props = $props();
</script>

<div class="flex justify-end gap-2 items-end mb-2 screenshot-hidden">
	<Field label="Settings" labelPlacement="inset" let:id dense>
		<Switch
			checked={showSettings}
			on:change={() => (showSettings = !showSettings)}
			{id}
			size="md"
		/>
	</Field>
</div>
