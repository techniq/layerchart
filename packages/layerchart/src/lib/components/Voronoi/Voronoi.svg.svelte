<script lang="ts" module>
  export type { VoronoiProps, VoronoiPropsWithoutHTML } from './Voronoi.shared.svelte.js';
</script>

<script lang="ts">
  import VoronoiBase from './Voronoi.base.svelte';
  import Group from '../Group/Group.svg.svelte';
  import Path from '../Path/Path.svg.svelte';
  import CircleClipPath from '../CircleClipPath/CircleClipPath.svg.svelte';
  import type { VoronoiProps } from './Voronoi.shared.svelte.js';

  let props: VoronoiProps = $props();
</script>

<VoronoiBase {Group} {Path} {CircleClipPath} {...props} />
