<script lang="ts">
	import { Breadcrumb, Button, Field, ToggleGroup, ToggleOption } from 'svelte-ux';

	// <SunburstControls bind:colorBy />

	interface Props {
		colorBy?: 'parent' | 'depth';
	}

	let { colorBy = $bindable('parent') }: Props = $props();
</script>

<div class="grid grid-cols-[1fr_1fr] gap-2 screenshot-hidden">
	<Field label="Color By">
		<ToggleGroup bind:value={colorBy} variant="outline" size="sm" inset class="w-full">
			<ToggleOption value="parent">Parent</ToggleOption>
			<ToggleOption value="depth">Depth</ToggleOption>
		</ToggleGroup>
	</Field>
</div>
