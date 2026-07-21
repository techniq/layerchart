<!--
  Reproduces the docs example pattern where the `children` snippet reads
  `context.brush.*` during render. `BrushContext` is lazy-loaded, so `context.brush`
  is read before it mounts — it must never be null (regression: previously threw
  "Cannot read properties of null (reading 'active')").
-->
<script lang="ts">
  import Chart from '../Chart/Chart.svelte';
  import Layer from '../layers/Layer.svelte';

  let { chartProps = {} }: { chartProps?: Record<string, any> } = $props();
</script>

<Chart {...chartProps} brush height={40}>
  {#snippet children({ context })}
    <Layer>
      {#if context.brush.active}
        <rect
          x={context.brush.range.x}
          width={context.brush.handleSize}
          height={context.brush.range.height}
        />
      {/if}
    </Layer>
  {/snippet}
</Chart>
