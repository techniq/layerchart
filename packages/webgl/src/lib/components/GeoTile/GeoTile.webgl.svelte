<script lang="ts" module>
  import type { GeoTileProps } from './GeoTile.shared.svelte.js';
</script>

<script lang="ts">
  import Group from '../Group/Group.webgl.svelte';
  import GeoTileTiles from './GeoTile.tiles.svelte';

  let { group, ...props }: GeoTileProps = $props();
</script>

<!-- In a `Group` of its `group` props, as the core `GeoTile` draws its tiles in one -->
{#if group}
  <Group {...group}>
    <GeoTileTiles {...props} />
  </Group>
{:else}
  <GeoTileTiles {...props} />
{/if}
