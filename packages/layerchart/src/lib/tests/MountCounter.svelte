<script lang="ts" module>
  /** Mount/destroy tally, so a test can assert the chart builds its children exactly once. */
  export const mountCounts = $state({ mount: 0, destroy: 0 });

  /**
   * The plot size this child saw while it was being constructed.
   *
   * Marks capture the scales as they are built — a motion baseline, an initial position — so this
   * is what those reads would have returned. It must already be the measured layout, never the
   * placeholder `ChartState` starts from.
   */
  export const sizeAtConstruction = $state({ width: -1, height: -1, containerWidth: -1 });

  export function resetMountCounts() {
    mountCounts.mount = 0;
    mountCounts.destroy = 0;
    sizeAtConstruction.width = -1;
    sizeAtConstruction.height = -1;
    sizeAtConstruction.containerWidth = -1;
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { getChartContext } from '$lib/contexts/chart.js';

  const ctx = getChartContext();
  sizeAtConstruction.width = ctx.width;
  sizeAtConstruction.height = ctx.height;
  sizeAtConstruction.containerWidth = ctx.containerWidth;

  onMount(() => {
    mountCounts.mount += 1;
    return () => {
      mountCounts.destroy += 1;
    };
  });
</script>
