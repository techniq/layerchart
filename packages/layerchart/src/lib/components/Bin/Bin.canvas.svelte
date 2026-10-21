<script lang="ts" module>
  export type { BinCell, BinProps, BinPropsWithoutHTML, BinShape } from './Bin.shared.svelte.js';
</script>

<script lang="ts">
  import BinBase from './Bin.base.svelte';
  import Group from '../Group/Group.canvas.svelte';
  import Path from '../Path/Path.canvas.svelte';
  import ChartClipPath from '../ChartClipPath/ChartClipPath.canvas.svelte';
  import type { BinProps } from './Bin.shared.svelte.js';

  let props: BinProps = $props();
</script>

<BinBase {Group} {ChartClipPath} {Path} {...props} />
