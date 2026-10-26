<script lang="ts" module>
  export type { GeoBinProps, GeoBinPropsWithoutHTML } from './GeoBin.shared.svelte.js';
</script>

<script lang="ts">
  import { getChartContext } from '$lib/contexts/chart.js';
  import BinBase from '../../Bin/Bin.base.svelte';
  import Group from '../../Group/Group.svg.svelte';
  import Path from '../../Path/Path.svg.svelte';
  import ChartClipPath from '../../ChartClipPath/ChartClipPath.svg.svelte';
  import { sphereBinning } from './GeoBin.sphere.js';
  import type { GeoBinProps } from './GeoBin.shared.svelte.js';

  let props: GeoBinProps = $props();
  // Stood up by `z` with the `isometric` view's own `Path`
  const ctx = getChartContext();
</script>

<BinBase
  {Group}
  Path={(props.z != null && ctx.isometric?.PathExtruded) || Path}
  {ChartClipPath}
  sphere={sphereBinning}
  {...props}
/>
