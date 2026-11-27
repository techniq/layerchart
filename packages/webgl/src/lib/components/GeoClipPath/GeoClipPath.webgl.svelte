<script lang="ts">
  import type { GeoClipPathProps } from 'layerchart/geo';
  import { GeoClipPathBase } from 'layerchart/base';
  import ClipPath from '../ClipPath/ClipPath.webgl.svelte';

  let props: GeoClipPathProps = $props();
</script>

<!-- LayerChart's `GeoClipPath`, clipping with the scene's `ClipPath` -->
<GeoClipPathBase {ClipPath} {...props} />
