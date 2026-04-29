<script lang="ts" module>
  export type { VoronoiProps, VoronoiPropsWithoutHTML } from './Voronoi.shared.svelte.js';
</script>

<script lang="ts">
  import VoronoiBase from './Voronoi.base.svelte';
  import Group from '../Group/Group.canvas.svelte';
  import Path from '../Path/Path.canvas.svelte';
  import CircleClipPath from '../CircleClipPath/CircleClipPath.canvas.svelte';
  import type { VoronoiProps } from './Voronoi.shared.svelte.js';

  let props: VoronoiProps = $props();
</script>

<VoronoiBase {Group} {Path} {CircleClipPath} {...props} />
