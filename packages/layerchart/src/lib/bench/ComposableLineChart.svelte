<script lang="ts">
  import Chart from '../components/Chart.svelte';
  import Layer from '../components/layers/Layer.svelte';
  import Axis from '../components/Axis.svelte';
  import Spline from '../components/Spline.svelte';
  import Highlight from '../components/Highlight.svelte';

  type Props = {
    data: any[];
    x: string;
    y?: string;
    width?: number;
    height?: number;
    xDomain?: any;
    yDomain?: any;
    series?: any[];
    layer?: 'svg' | 'canvas';
    axis?: boolean;
    highlight?: boolean;
  };

  let {
    data,
    x,
    y,
    width,
    height,
    xDomain,
    yDomain,
    series,
    layer = 'svg',
    axis = false,
    highlight = false,
  }: Props = $props();
</script>

<Chart {data} {x} {y} {width} {height} {series} xDomain={xDomain} yDomain={yDomain}>
  <Layer type={layer}>
    {#if axis}
      <Axis placement="left" />
      <Axis placement="bottom" />
    {/if}

    {#if series}
      {#each series as s (s.key)}
        <Spline seriesKey={s.key} />
      {/each}
    {:else}
      <Spline />
    {/if}

    {#if highlight}
      <Highlight />
    {/if}
  </Layer>
</Chart>
