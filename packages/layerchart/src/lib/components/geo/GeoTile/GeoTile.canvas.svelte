<script lang="ts" module>
  export type { GeoTilePropsWithoutHTML } from './GeoTile.shared.svelte.js';
</script>

<script lang="ts">
  import GeoTileBase from './GeoTile.base.svelte';
  import Group from '../../Group/Group.canvas.svelte';
  import TileImage from '../TileImage/TileImage.canvas.svelte';
  import type { GeoTilePropsWithoutHTML } from './GeoTile.shared.svelte.js';

  let props: GeoTilePropsWithoutHTML = $props();
</script>

<GeoTileBase {Group} {TileImage} {...props} />
