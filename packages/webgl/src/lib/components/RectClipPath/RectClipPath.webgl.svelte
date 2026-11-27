<script lang="ts">
  import type { RectClipPathProps } from 'layerchart';
  import { RectClipPathBase } from 'layerchart/base';
  import ClipPath from '../ClipPath/ClipPath.webgl.svelte';

  let props: RectClipPathProps = $props();
</script>

<!-- LayerChart's `RectClipPath`, clipping with the scene's `ClipPath` -->
<RectClipPathBase {ClipPath} {...props} />
