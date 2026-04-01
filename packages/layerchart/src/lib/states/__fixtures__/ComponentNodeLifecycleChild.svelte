<script lang="ts">
  import { getChartContext } from '$lib/contexts/chart.js';

  const ctx = getChartContext();

  ctx.registerComponent({
    name: 'ComponentNodeLifecycleChild',
    kind: 'mark',
    markInfo: () => ({ y: 'other' }),
  });
</script>

<div data-testid="component-node-lifecycle-child"></div>
