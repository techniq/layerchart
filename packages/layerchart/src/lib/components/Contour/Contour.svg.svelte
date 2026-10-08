<script lang="ts" module>
  export type { ContourProps, ContourPropsWithoutHTML } from './Contour.shared.svelte.js';
</script>

<script lang="ts">
  import { getChartContext } from '$lib/contexts/chart.js';
  import ContourBase from './Contour.base.svelte';
  import Group from '../Group/Group.svg.svelte';
  import Path from '../Path/Path.svg.svelte';
  import type { ContourProps } from './Contour.shared.svelte.js';

  let props: ContourProps = $props();
  // Stood up by `z` with the `isometric` view's own `Path`
  const ctx = getChartContext();
</script>

<ContourBase {Group} Path={(props.z != null && ctx.isometric?.PathExtruded) || Path} {...props} />
