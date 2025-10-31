<script lang="ts">
	import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

	interface Props {
		padding?: number;
		colorBy?: 'parent' | 'depth' | 'children';
	}

	let { padding = $bindable(0), colorBy = $bindable('parent') }: Props = $props();
</script>

<div class="grid grid-cols-[2fr_1fr] gap-2">
	<RangeField label="Padding" bind:value={padding} max={50} />
	<Field label="Color By">
		<ToggleGroup bind:value={colorBy} variant="outline" size="sm" inset class="w-full">
			<ToggleOption value="parent">Parent</ToggleOption>
			<ToggleOption value="depth">Depth</ToggleOption>
		</ToggleGroup>
	</Field>
</div>
