<script lang="ts">
	import { Field, RangeField, ToggleGroup, ToggleOption, Switch } from 'svelte-ux';

	// <PartitionControls bind:padding bind:fullSizeLeafNodes bind:round bind:colorBy bind:isFiltered filterable />

	interface Props {
		padding?: number;
		fullSizeLeafNodes?: boolean;
		round?: boolean;
		colorBy?: 'children' | 'depth' | 'parent';
		isFiltered?: boolean;
		filterable?: boolean;
	}

	let {
		padding = $bindable(0),
		fullSizeLeafNodes = $bindable(false),
		round = $bindable(false),
		colorBy = $bindable('children'),
		isFiltered = $bindable(false),
		filterable = false
	}: Props = $props();
</script>

<div class="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2">
	<RangeField label="Padding" bind:value={padding} max={20} />
	<Field label="Full-size Leaf Nodes">
		<ToggleGroup bind:value={fullSizeLeafNodes} variant="outline" size="sm" inset class="w-full">
			<ToggleOption value={true}>Yes</ToggleOption>
			<ToggleOption value={false}>No</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Round">
		<ToggleGroup bind:value={round} variant="outline" size="sm" inset class="w-full">
			<ToggleOption value={true}>Yes</ToggleOption>
			<ToggleOption value={false}>No</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Color By">
		<ToggleGroup bind:value={colorBy} variant="outline" size="sm" inset class="w-full">
			<ToggleOption value="children">Children</ToggleOption>
			<ToggleOption value="depth">Depth</ToggleOption>
			<ToggleOption value="parent">Parent</ToggleOption>
		</ToggleGroup>
	</Field>
</div>
{#if filterable}
	<div class="grid grid-cols-4 gap-2 mt-2">
		<Field label="Apply Partial Filter" let:id>
			<Switch {id} bind:checked={isFiltered} />
		</Field>
	</div>
{/if}
