<script lang="ts">
  import { BarBase } from 'layerchart/base';
  import Arc from '../Arc/Arc.svelte';
  import Rect from '../Rect/Rect.svelte';

  let props: Record<string, any> = $props();
</script>

<!-- LayerChart's `Bar`: an `Arc` on a `radial` chart -->
<BarBase {Rect} {Arc} {...props as any} />
