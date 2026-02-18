<script lang="ts">
	import { curveCatmullRomClosed, curveLinearClosed } from 'd3-shape';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

	interface Props {
		curve?: typeof curveLinearClosed | typeof curveCatmullRomClosed;
	}

	let { curve = $bindable(curveLinearClosed) }: Props = $props();
</script>

<div class="screenshot-hidden">
	<Field label="curve: " labelPlacement="left" dense class="absolute top-2 right-2 z-1">
		<ToggleGroup bind:value={curve} size="sm">
			<ToggleOption value={curveLinearClosed}>Linear</ToggleOption>
			<ToggleOption value={curveCatmullRomClosed}>CatmullRom</ToggleOption>
		</ToggleGroup>
	</Field>
</div>
