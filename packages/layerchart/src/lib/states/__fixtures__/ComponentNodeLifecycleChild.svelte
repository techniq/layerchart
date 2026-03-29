<script lang="ts">
  import { getChartContext } from '$lib/contexts/chart.js';

  const ctx = getChartContext();

  ctx.registerComponentNode({
    name: 'ComponentNodeLifecycleChild',
    kind: 'mark',
    markInfo: () => ({ y: 'value' }),
  });
</script>

<div data-testid="component-node-lifecycle-child"></div>
