<script lang="ts">
  import type { ChartClipPathProps } from 'layerchart';
  import { ChartClipPathBase } from 'layerchart/base';
  import { setUnclipped } from '../../contexts/scene.svelte.js';
  import RectClipPath from '../RectClipPath/RectClipPath.webgl.svelte';

  let props: ChartClipPathProps = $props();

  // Clipped to the plot (with its padding when `full`, ex. a series' points and labels at its edge
  // reaching into it), as the core `ChartClipPath` clips: past the scene's own clip to the plot
  // box (see `WebGL`'s `clip`) when `full`
  // svelte-ignore state_referenced_locally
  if (props.full) setUnclipped();
</script>

<ChartClipPathBase {RectClipPath} {...props} />
