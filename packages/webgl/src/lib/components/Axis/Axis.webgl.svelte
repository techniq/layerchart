<script lang="ts" module>
  import type { AxisProps } from './Axis.shared.svelte.js';
</script>

<script lang="ts">
  import Group from '../Group/Group.webgl.svelte';
  import AxisBase from './Axis.base.svelte';

  let { x, initialX, y, initialY, data, key, seriesKey, center, opacity, ...props }: AxisProps =
    $props();

  /** Placed (or faded) as a `Group`, as the core `Axis` is one */
  const grouped = $derived(
    [x, initialX, y, initialY, data, key, seriesKey, center, opacity].some((v) => v !== undefined)
  );
</script>

{#if grouped}
  <Group {x} {initialX} {y} {initialY} {data} {key} {seriesKey} {center} {opacity}>
    <AxisBase {...props} />
  </Group>
{:else}
  <AxisBase {...props} />
{/if}
