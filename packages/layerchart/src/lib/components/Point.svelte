<script lang="ts">
  import { chartContext } from './ChartContext.svelte';

  const context = chartContext() as any;
  const { xGet, yGet } = context;

  /** Single data point to translate to x/y */
  export let d;

  $: x = $xGet(d);
  $: y = $yGet(d);
</script>

<slot {x} {y} />
