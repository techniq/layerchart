<script lang="ts">
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

	interface Props {
		position: 'start' | 'middle' | 'end';
	}

	let { position = $bindable('end') }: Props = $props();
</script>

<Field label="truncate position" classes={{ container: 'w-fit' }}>
	<ToggleGroup bind:value={position} variant="outline" size="sm" inset class="w-full">
		<ToggleOption value="start">start</ToggleOption>
		<ToggleOption value="middle">middle</ToggleOption>
		<ToggleOption value="end">end</ToggleOption>
	</ToggleGroup>
</Field>
