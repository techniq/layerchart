<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { RangeField } from 'svelte-ux';
	import TilesetField from '$lib/components/TilesetField.svelte';
	import type { GeoTile } from 'layerchart';

	// <ZoomableTileMapControls bind:serviceUrl bind:zoomDelta />

	interface Props {
		serviceUrl?: ComponentProps<typeof GeoTile>['url'];
		zoomDelta?: number;
	}

	let { serviceUrl = $bindable(null!), zoomDelta = $bindable(0) }: Props = $props();
</script>

<div class="grid grid-cols-[1fr_1fr] gap-2 my-2 lc-example-controls">
	<TilesetField bind:serviceUrl />
	<RangeField label="Zoom delta" bind:value={zoomDelta} min={-5} max={5} />
</div>
