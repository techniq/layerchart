<script lang="ts" module>
  export type { ArcProps, ArcPropsWithoutHTML } from './Arc.shared.svelte.js';
</script>

<script lang="ts">
  import { getChartContext } from '$lib/contexts/chart.js';
  import ArcBase from './Arc.base.svelte';
  import Path from '../Path/Path.svg.svelte';

  import type { ArcProps } from './Arc.shared.svelte.js';

  let props: ArcProps = $props();
  // Stood up by `z` with the `isometric` view's own `Path`
  const ctx = getChartContext();
</script>

<ArcBase Path={(props.z != null && ctx.isometric?.PathExtruded) || Path} {...props} />
