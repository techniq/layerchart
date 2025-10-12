<script lang="ts">
  import { Axis, Chart, Rule, Layer } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries, createTimeSeries } from '$lib/utils/genData.js';
  import { shared } from '../../shared.svelte.js';
  import { sort } from 'd3-array';

  let { data } = $props();

  const dateData = createDateSeries({ count: 20, keys: ['value', 'low', 'high'] });
  const timeData = createTimeSeries();
  const alphabetData = $derived(sort(data.alphabet, (d) => d.letter));
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
      <Layer type={shared.layer}>
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
      <Layer type={shared.layer}>
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
      <Layer type={shared.layer}>
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
      <Layer type={shared.layer}>
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
      xDomain={[0, 100]}
      yDomain={[-20, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={shared.layer}>
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
      <Layer type={shared.layer}>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
        <Rule y={70} class="stroke-2 stroke-danger [stroke-dasharray:4] [stroke-linecap:round] " />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>data driven (x time / y value)</h2>

<Preview data={dateData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={dateData}
      x="date"
      y="value"
      yNice
      padding={{ top: 20, bottom: 20, left: 40, right: 20 }}
    >
      <Layer type={shared.layer}>
        <Axis placement="bottom" rule />
        <Axis placement="left" />
        <Rule class="stroke-2 stroke-primary" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>data driven (x band / y value)</h2>

<Preview data={alphabetData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={alphabetData}
      x="letter"
      y="frequency"
      yNice
      padding={{ top: 20, bottom: 20, left: 40, right: 20 }}
    >
      <Layer type={shared.layer}>
        <Axis placement="bottom" rule />
        <Axis placement="left" />
        <Rule class="stroke-2 stroke-primary" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>data driven (x range)</h2>

<Preview data={timeData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={timeData}
      x={['startDate', 'endDate']}
      y="name"
      padding={{ top: 20, bottom: 20, left: 40, right: 20 }}
    >
      <Layer type={shared.layer}>
        <Axis placement="bottom" />
        <Axis placement="left" rule />
        <Rule class="stroke-2 stroke-primary" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>data driven (y range)</h2>

<Preview data={dateData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={dateData}
      x="date"
      y={['low', 'high']}
      yNice
      padding={{ top: 20, bottom: 20, left: 40, right: 20 }}
    >
      <Layer type={shared.layer}>
        <Axis placement="bottom" rule />
        <Axis placement="left" />
        <Rule class="stroke-2 stroke-primary" />
      </Layer>
    </Chart>
  </div>
</Preview>
