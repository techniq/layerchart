<script lang="ts" module>
  import type { BarsProps } from './Bars.shared.svelte.js';
</script>

<script lang="ts">
  import { getChartContext } from 'layerchart';
  import BarsBase from './Bars.base.svelte';

  let { children, ...props }: BarsProps = $props();

  const ctx = getChartContext();
  ctx.registerComponent({
    name: 'Bars',
    kind: 'mark',
    markInfo: () => ({
      data: props.data,
      x: props.x,
      y: props.y,
      seriesKey: props.seriesKey,
      color: typeof props.fill === 'string' ? props.fill : undefined,
      stacks: props.z == null,
    }),
  });
</script>

{#if children}
  {@render children()}
{:else}
  <BarsBase {...props} />
{/if}
