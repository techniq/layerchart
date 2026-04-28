<script lang="ts" module>
  export type { GeoTilePropsWithoutHTML } from './GeoTile.shared.svelte.js';
</script>

<script lang="ts">
  import GeoTileBase from './GeoTile.base.svelte';
  import Group from '../../Group/Group.svg.svelte';
  import TileImage from '../TileImage/TileImage.svg.svelte';
  import type { GeoTilePropsWithoutHTML } from './GeoTile.shared.svelte.js';

  let props: GeoTilePropsWithoutHTML = $props();
</script>

<GeoTileBase {Group} {TileImage} {...props} />
