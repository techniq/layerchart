<script lang="ts">
  import type { GeoEdgeFadeProps } from 'layerchart/geo';
  import { GeoEdgeFadeBase } from 'layerchart/base';
  import Group from './GeoEdgeFade.group.svelte';

  let { ref = $bindable(), ...props }: GeoEdgeFadeProps = $props();
</script>

<!-- LayerChart's `GeoEdgeFade`: its children in a `Group` faded by their distance from the
     projection's center -->
<GeoEdgeFadeBase {Group} bind:ref {...props} />
