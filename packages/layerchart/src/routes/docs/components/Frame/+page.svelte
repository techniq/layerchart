<script lang="ts">
  import { Axis, Chart, Layer, Frame, LinearGradient } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';
  import { shared } from '../../shared.svelte.js';
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={[]}
      x="x"
      xDomain={[0, 100]}
      y="y"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Frame class="fill-danger/5" />
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>full</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={[]}
      x="x"
      xDomain={[0, 100]}
      y="y"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Frame class="fill-danger/5" full />
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>border</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={[]}
      x="x"
      xDomain={[0, 100]}
      y="y"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Frame class="stroke-surface-content/50 fill-none" />
        <Axis placement="bottom" />
        <Axis placement="left" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>gradient background</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={[]}
      x="x"
      xDomain={[0, 100]}
      y="y"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={shared.renderContext}>
        <LinearGradient class="from-primary/10 to-secondary/10" vertical>
          {#snippet children({ gradient })}
            <Frame class="stroke-primary/10" fill={gradient} />
          {/snippet}
        </LinearGradient>
        <Axis placement="bottom" />
        <Axis placement="left" />
      </Layer>
    </Chart>
  </div>
</Preview>
