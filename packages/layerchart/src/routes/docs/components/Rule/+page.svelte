<script lang="ts">
  import { scaleTime } from 'd3-scale';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Preview from '$lib/docs/Preview.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Rule from '$lib/components/Rule.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';

  const data = createDateSeries({ min: 50, max: 100, value: 'integer' });
</script>

<h1>Examples</h1>

<h2>x and y baselines</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      xDomain={[0, 100]}
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="bottom" />
        <Axis placement="left" />
        <Rule x y />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>top right x and y baselines</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      xDomain={[0, 100]}
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="top" />
        <Axis placement="right" />
        <Rule x="right" y="top" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>x baseline with negative values</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      xDomain={[-20, 100]}
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="bottom" />
        <Axis placement="left" />
        <Rule x={0} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>x annotation</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      xDomain={[0, 100]}
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
        <Rule x={70} class="stroke-2 stroke-danger [stroke-dasharray:4] [stroke-linecap:round] " />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>y baseline with negative values</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={[]}
      xDomain={[0, 100]}
      yDomain={[-20, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="bottom" />
        <Axis placement="left" />
        <Rule y={0} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>y annotation</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      xDomain={[0, 100]}
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
        <Rule y={70} class="stroke-2 stroke-danger [stroke-dasharray:4] [stroke-linecap:round] " />
      </Svg>
    </Chart>
  </div>
</Preview>
