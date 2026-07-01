<script lang="ts" module>
  export type { ChartClipPathProps, ChartClipPathPropsWithoutHTML } from './ChartClipPath.shared.svelte.js';
</script>

<script lang="ts">
  import ChartClipPathBase from './ChartClipPath.base.svelte';
  import RectClipPath from '../RectClipPath/RectClipPath.canvas.svelte';

  import type { ChartClipPathProps } from './ChartClipPath.shared.svelte.js';

  let props: ChartClipPathProps = $props();
</script>

<ChartClipPathBase {RectClipPath} {...props} />
