<script lang="ts" module>
  export type { BlurProps, BlurPropsWithoutHTML } from './Blur.shared.svelte.js';
</script>

<script lang="ts">
  import { getChartContext } from '$lib/contexts/chart.js';
  import type { BlurProps } from './Blur.shared.svelte.js';

  let { stdDeviation = 5, children }: BlurProps = $props();

  const chartCtx = getChartContext();

  chartCtx.registerComponent({
    name: 'Blur',
    kind: 'group',
    canvasRender: {
      render: (ctx) => {
        ctx.filter = `blur(${stdDeviation}px)`;
      },
      deps: () => [stdDeviation],
    },
  });
</script>

{@render children?.()}
