<script lang="ts">
  import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';
  import type { TreemapLayoutOptions, TreemapTileMethod, TreemapColorBy } from 'layerchart';

  // <TreemapControls bind:tile bind:maintainAspectRatio bind:colorBy bind:paddingOuter bind:paddingInner bind:paddingTop bind:paddingBottom bind:paddingLeft bind:paddingRight />

  interface Props {
    tile?: TreemapTileMethod;
    maintainAspectRatio?: boolean;
    colorBy?: TreemapColorBy;
    paddingOuter?: number;
    paddingInner?: number;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
  }

  let {
    tile = $bindable<TreemapTileMethod>('squarify'),
    maintainAspectRatio = $bindable<boolean>(true),
    colorBy = $bindable<TreemapColorBy>('children'),
    paddingOuter = $bindable<number>(0),
    paddingInner = $bindable<number>(1),
    paddingTop = $bindable<number>(0),
    paddingBottom = $bindable<number>(0),
    paddingLeft = $bindable<number>(0),
    paddingRight = $bindable<number>(0)
  }: Props = $props();

</script>

<div class="grid grid-cols-[6fr_1fr_3fr] gap-1">
	<Field label="Tile">
		<ToggleGroup bind:value={tile} variant="outline" size="sm" inset class="w-full">
			<ToggleOption value="squarify">Squarify</ToggleOption>
			<ToggleOption value="resquarify">Resquarify</ToggleOption>
			<ToggleOption value="binary">Binary</ToggleOption>
			<ToggleOption value="slice">Slice</ToggleOption>
			<ToggleOption value="dice">Dice</ToggleOption>
			<ToggleOption value="sliceDice">Slice / Dice</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Maintain Aspect Ratio">
		<ToggleGroup bind:value={maintainAspectRatio} variant="outline" size="sm" inset class="w-full">
			<ToggleOption value={false}>No</ToggleOption>
			<ToggleOption value={true}>Yes</ToggleOption>
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
<div class="grid grid-cols-2 gap-2">
	<RangeField label="Padding Outer" bind:value={paddingOuter} />
	<RangeField label="Padding Inner" bind:value={paddingInner} />
</div>
<div class="grid grid-cols-4 gap-2">
	<RangeField label="Padding Top" bind:value={paddingTop} />
	<RangeField label="Padding Bottom" bind:value={paddingBottom} />
	<RangeField label="Padding Left" bind:value={paddingLeft} />
	<RangeField label="Padding Right" bind:value={paddingRight} />
</div>
