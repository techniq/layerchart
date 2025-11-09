<script lang="ts">
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

	// <GroupControl bind:groupBy />

	interface Props {
		groupBy?: boolean;
	}

	let { groupBy = $bindable(true) }: Props = $props();
</script>

<div class="flex justify-end gap-2 items-end mb-2 lc-example-controls">
	<Field labelPlacement="left" class="mb-1" dense>
		<ToggleGroup bind:value={groupBy} size="sm">
			<ToggleOption value={true}>Group</ToggleOption>
			<ToggleOption value={false}>Clump</ToggleOption>
		</ToggleGroup>
	</Field>
</div>
