<script lang="ts" module>
  export type { GeoBinProps, GeoBinPropsWithoutHTML } from './GeoBin.shared.svelte.js';
</script>

<script lang="ts">
  import BinBase from '../../Bin/Bin.base.svelte';
  import Group from '../../Group/Group.canvas.svelte';
  import Path from '../../Path/Path.canvas.svelte';
  import ChartClipPath from '../../ChartClipPath/ChartClipPath.canvas.svelte';
  import { sphereBinning } from './GeoBin.sphere.js';
  import type { GeoBinProps } from './GeoBin.shared.svelte.js';

  let props: GeoBinProps = $props();
</script>

<BinBase {Group} {Path} {ChartClipPath} sphere={sphereBinning} {...props} />
