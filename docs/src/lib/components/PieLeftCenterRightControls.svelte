<script lang="ts">
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

	// <PieLeftCenterRightControls bind:placement />

	interface Props {
		placement?: 'left' | 'center' | 'right';
	}

	let { placement = $bindable('left') }: Props = $props();
</script>

<div class="mb-2 w-full lc-example-controls">
	<Field label="Placement">
		<ToggleGroup bind:value={placement} variant="outline" size="sm" inset class="w-full">
			<ToggleOption value="left">Left</ToggleOption>
			<ToggleOption value="center">Center</ToggleOption>
			<ToggleOption value="right">Right</ToggleOption>
		</ToggleGroup>
	</Field>
</div>
