<script lang="ts" module>
  export type { BinCell, BinProps, BinPropsWithoutHTML, BinShape } from './Bin.shared.svelte.js';
</script>

<script lang="ts">
  import { getChartContext } from '$lib/contexts/chart.js';
  import BinBase from './Bin.base.svelte';
  import Group from '../Group/Group.svg.svelte';
  import Path from '../Path/Path.svg.svelte';
  import type { BinProps } from './Bin.shared.svelte.js';

  let props: BinProps = $props();
  // Stood up by `z` with the `isometric` view's own `Path`
  const ctx = getChartContext();
</script>

<BinBase {Group} Path={(props.z != null && ctx.isometric?.PathExtruded) || Path} {...props} />
