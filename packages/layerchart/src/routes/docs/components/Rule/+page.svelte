<script lang="ts">
  import { Axis, Chart, Rule, Layer } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';
  import { shared } from '../../shared.svelte.js';

  const data = createDateSeries({ min: 50, max: 100, value: 'integer' });
</script>

<h1>Examples</h1>

<h2>x and y baselines</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      xDomain={[0, 100]}
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" />
        <Axis placement="left" />
        <Rule x y />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>top right x and y baselines</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      xDomain={[0, 100]}
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="top" />
        <Axis placement="right" />
        <Rule x="$right" y="$top" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>x baseline with negative values</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      xDomain={[-20, 100]}
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" />
        <Axis placement="left" />
        <Rule x={0} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>x annotation</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      xDomain={[0, 100]}
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
        <Rule x={70} class="stroke-2 stroke-danger [stroke-dasharray:4] [stroke-linecap:round] " />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>y baseline with negative values</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={[]}
      xDomain={[0, 100]}
      yDomain={[-20, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" />
        <Axis placement="left" />
        <Rule y={0} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>y annotation</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      xDomain={[0, 100]}
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
        <Rule y={70} class="stroke-2 stroke-danger [stroke-dasharray:4] [stroke-linecap:round] " />
      </Layer>
    </Chart>
  </div>
</Preview>
