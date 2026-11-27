<script lang="ts">
  import type { CircleClipPathPropsWithoutHTML } from 'layerchart';
  import { CircleClipPathBase } from 'layerchart/base';
  import ClipPath from '../ClipPath/ClipPath.webgl.svelte';

  let props: CircleClipPathPropsWithoutHTML = $props();
</script>

<!-- LayerChart's `CircleClipPath`, clipping with the scene's `ClipPath` -->
<CircleClipPathBase {ClipPath} {...props} />
