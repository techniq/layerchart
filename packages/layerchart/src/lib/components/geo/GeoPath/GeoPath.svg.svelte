<script lang="ts" module>
  export type { GeoPathProps, GeoPathPropsWithoutHTML } from './GeoPath.shared.svelte.js';
</script>

<script lang="ts">
  import { getChartContext } from '$lib/contexts/chart.js';
  import GeoPathBase from './GeoPath.base.svelte';
  import Path from '../../Path/Path.svg.svelte';
  import type { GeoPathProps } from './GeoPath.shared.svelte.js';

  let props: GeoPathProps = $props();
  // Stood up by `z` with the `isometric` view's own `Path`
  const ctx = getChartContext();
</script>

<GeoPathBase Path={(props.z != null && ctx.isometric?.PathExtruded) || Path} {...props} />
