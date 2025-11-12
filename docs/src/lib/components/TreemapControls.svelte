<script lang="ts">
	import type { TreemapProps } from 'layerchart';
	import { Field, RangeField, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';

	type TreemapTileMethod = TreemapProps<any>['tile'];
	type TreemapColorBy = 'children' | 'depth' | 'parent';

	// <TreemapControls bind:config />

	interface TreemapConfig {
		tile: TreemapTileMethod;
		colorBy: TreemapColorBy;
		maintainAspectRatio: boolean;
		paddingOuter: number;
		paddingInner: number;
		paddingTop: number;
		paddingBottom: number;
		paddingLeft: number;
		paddingRight: number;
		isFiltered?: boolean;
	}

	interface Props {
		config?: TreemapConfig;
		hidePadding?: boolean;
		filterable?: boolean;
	}

	let {
		config = $bindable({
			tile: 'squarify' as TreemapTileMethod,
			colorBy: 'children' as TreemapColorBy,
			maintainAspectRatio: false,
			paddingOuter: 4,
			paddingInner: 4,
			paddingTop: 20,
			paddingBottom: 0,
			paddingLeft: 0,
			paddingRight: 0,
			isFiltered: false
		}),
		hidePadding = false,
		filterable = false
	}: Props = $props();
</script>

<div class="grid gap-2 mb-2 screenshot-hidden">
	<div class="grid grid-cols-[6fr_1fr_3fr] gap-2">
		<Field label="Tile">
			<ToggleGroup bind:value={config.tile} variant="outline" size="sm" inset class="w-full">
				<ToggleOption value="squarify">Squarify</ToggleOption>
				<ToggleOption value="resquarify">Resquarify</ToggleOption>
				<ToggleOption value="binary">Binary</ToggleOption>
				<ToggleOption value="slice">Slice</ToggleOption>
				<ToggleOption value="dice">Dice</ToggleOption>
				<ToggleOption value="sliceDice">Slice / Dice</ToggleOption>
			</ToggleGroup>
		</Field>
		<Field label="Maintain Aspect Ratio">
			<ToggleGroup
				bind:value={config.maintainAspectRatio}
				variant="outline"
				size="sm"
				inset
				class="w-full"
			>
				<ToggleOption value={false}>No</ToggleOption>
				<ToggleOption value={true}>Yes</ToggleOption>
			</ToggleGroup>
		</Field>
		<Field label="Color By">
			<ToggleGroup bind:value={config.colorBy} variant="outline" size="sm" inset class="w-full">
				<ToggleOption value="children">Children</ToggleOption>
				<ToggleOption value="depth">Depth</ToggleOption>
				<ToggleOption value="parent">Parent</ToggleOption>
			</ToggleGroup>
		</Field>
	</div>
	{#if !hidePadding}
		<div class="grid grid-cols-2 gap-2">
			<RangeField label="Padding Outer" bind:value={config.paddingOuter} />
			<RangeField label="Padding Inner" bind:value={config.paddingInner} />
		</div>
		<div class="grid grid-cols-4 gap-2">
			<RangeField label="Padding Top" bind:value={config.paddingTop} />
			<RangeField label="Padding Bottom" bind:value={config.paddingBottom} />
			<RangeField label="Padding Left" bind:value={config.paddingLeft} />
			<RangeField label="Padding Right" bind:value={config.paddingRight} />
		</div>
	{/if}

	{#if filterable}
		<div class="grid grid-cols-4 gap-2">
			<Field label="Apply Partial Filter" let:id>
				<Switch {id} bind:checked={config.isFiltered} />
			</Field>
		</div>
	{/if}
</div>
