<script lang="ts" module>
  export type { ChartProps } from 'layerchart';
</script>

<script lang="ts" generics="TData = any">
  import { ChartBase } from 'layerchart/base';
  import type { ChartProps } from 'layerchart';
  import ChartChildren from '../ChartChildren/ChartChildren.svelte';

  let { ref = $bindable(), context = $bindable(), ...props }: ChartProps<TData> = $props();
</script>

<!--
  LayerChart's `Chart`, its axes, grid, and highlight (`axis`, `grid`, `highlight`, ...) drawn with
  the marks here, so they draw in a `WebGL` layer too
-->
<ChartBase {ChartChildren} bind:ref bind:context {...props} />
