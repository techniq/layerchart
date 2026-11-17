<script lang="ts">
  /** A chart whose `domain` transform pans and zooms, with the highlighted point in `Svg` */
  import Chart from '../../Chart/Chart.svelte';
  import Svg from '../../layers/Svg.svelte';
  import Highlight from '../Highlight.svelte';

  let { oncontext, ...props }: Record<string, any> = $props();
</script>

<Chart
  data={[
    { x: 20, y: 30 },
    { x: 50, y: 60 },
    { x: 80, y: 40 },
  ]}
  x="x"
  y="y"
  xDomain={[0, 100]}
  yDomain={[0, 100]}
  transform={{ mode: 'domain' }}
  tooltipContext={{ mode: 'quadtree' }}
  width={400}
  height={300}
  {...props}
>
  {#snippet children({ context })}
    {oncontext?.(context)}
    <Svg>
      <Highlight points />
    </Svg>
  {/snippet}
</Chart>
