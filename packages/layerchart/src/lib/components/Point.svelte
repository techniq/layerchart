<script lang="ts" module>
  import type { Snippet } from 'svelte';

  export type PointProps = {
    /**
     * Single data point to translate to x/y
     */
    d: any;

    /**
     * Children containing the x and y values
     */
    children?: Snippet<[{ x: number; y: number }]>;
  };
</script>

<script lang="ts">
  import { getChartContext } from './Chart-Next.svelte';

  let { d, children }: PointProps = $props();

  const ctx = getChartContext();
</script>

{@render children?.({ x: ctx.xGet(d), y: ctx.yGet(d) })}
