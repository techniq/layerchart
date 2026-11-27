<script lang="ts">
  import type { VoronoiProps } from 'layerchart';
  import { VoronoiBase } from 'layerchart/base';
  import Group from '../Group/Group.svelte';
  import Path from '../Path/Path.svelte';
  import CircleClipPath from '../CircleClipPath/CircleClipPath.svelte';

  let props: VoronoiProps = $props();
</script>

<!-- LayerChart's `Voronoi`, drawn with the marks here -->
<VoronoiBase {Group} {Path} {CircleClipPath} {...props} />
