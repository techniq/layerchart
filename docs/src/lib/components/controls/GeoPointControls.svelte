<script lang="ts">
	import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

	interface Props {
		tooltipMode?: 'quadtree' | 'voronoi';
		tooltipRadius?: number;
	}

	let { tooltipMode = $bindable(), tooltipRadius = $bindable() }: Props = $props();
</script>

<div class="flex gap-2 screenshot-hidden">
	<Field label="Tooltip mode" class="grow">
		<ToggleGroup bind:value={tooltipMode} variant="outline">
			<ToggleOption value="quadtree">quadtree</ToggleOption>
			<ToggleOption value="voronoi">voronoi</ToggleOption>
		</ToggleGroup>
	</Field>

	<RangeField label="Tooltip radius" bind:value={tooltipRadius} max={100} class="grow" />
</div>
