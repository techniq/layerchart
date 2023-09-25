<script lang="ts">
  import { scaleBand } from 'd3-scale';
  import { stackOffsetExpand } from 'd3-shape';
  import { format } from 'date-fns';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Bars from '$lib/components/Bars.svelte';
  import Highlight from '$lib/components/Highlight.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  import Preview from '$lib/docs/Preview.svelte';
  import { createStackData, stackOffsetSeparated } from '$lib/utils/stack';
  import { createDateSeries, longData } from '$lib/utils/genData';

  const data = createDateSeries({
    count: 30,
    min: 20,
    max: 100,
    value: 'integer',
    keys: ['value', 'baseline'],
  });
  const negativeData = createDateSeries({ count: 30, min: -20, max: 50, value: 'integer' });

  const groupedData = createStackData(longData, { xKey: 'year', groupBy: 'fruit' });
  const stackedData = createStackData(longData, { xKey: 'year', stackBy: 'fruit' });
  const groupedStackedData = createStackData(longData, {
    xKey: 'year',
    groupBy: 'basket',
    stackBy: 'fruit',
  });
  const stackedPercentData = createStackData(longData, {
    xKey: 'year',
    stackBy: 'fruit',
    offset: stackOffsetExpand,
  });
  const stackedSeperatedData = createStackData(longData, {
    xKey: 'year',
    stackBy: 'fruit',
    offset: stackOffsetSeparated,
  });

  const colorKeys = [...new Set(longData.map((x) => x.fruit))];
  const keyColors = [
    'var(--color-blue-500)',
    'var(--color-green-500)',
    'var(--color-purple-500)',
    'var(--color-orange-500)',
  ];

  let transitionChartMode = 'group';
  $: transitionChart =
    transitionChartMode === 'group'
      ? {
          groupBy: 'fruit',
          stackBy: undefined,
        }
      : transitionChartMode === 'stack'
      ? {
          groupBy: undefined,
          stackBy: 'fruit',
        }
      : transitionChartMode === 'groupStack'
      ? {
          groupBy: 'basket',
          stackBy: 'fruit',
        }
      : {
          groupBy: undefined,
          stackBy: undefined,
        };
  $: transitionData = createStackData(longData, {
    xKey: 'year',
    groupBy: transitionChart.groupBy,
    stackBy: transitionChart.stackBy,
  });
  // $: console.log({ transitionData })
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview>
  <div class="w-[125px] h-[18px]">
    <Chart
      {data}
      x="date"
      xScale={scaleBand()}
      y="value"
      yDomain={[0, null]}
    >
      <Svg>
        <Bars strokeWidth={1} class="fill-gray-200 stroke-gray-400" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Basic within a paragraph</h2>
<Preview>
  <div>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pretium, ligula ac sollicitudin
      ullamcorper, leo justo pretium tellus, at gravida ex quam et orci.
      <span class="w-[125px] h-[18px] inline-block">
        <Chart
          {data}
          x="date"
          xScale={scaleBand()}
          y="value"
          yDomain={[0, null]}
        >
          <Svg>
            <Bars strokeWidth={1} class="fill-gray-200 stroke-gray-400" />
          </Svg>
        </Chart>
      </span> Sed ipsum justo, facilisis id tempor hendrerit, suscipit eu ipsum. Mauris ut sapien quis
      nibh volutpat venenatis. Ut viverra justo varius sapien convallis venenatis vel faucibus urna.
    </p>
  </div>
</Preview>



<h2>Basic negative data</h2>

<Preview>
  <div class="w-[125px] h-[18px]">
    <Chart
      data={negativeData}
      x="date"
      xScale={scaleBand()}
      y="value"
      yDomain={[null, null]}
    >
      <Svg>
        <Bars strokeWidth={1} class="fill-gray-200 stroke-gray-400" />
      </Svg>
    </Chart>
  </div>
</Preview>


<h2>With Tooltip and Highlight</h2>
<Preview>
  <div class="w-[125px] h-[25px]">
    <Chart
      {data}
      x="date"
      xScale={scaleBand()}
      y="value"
      yDomain={[null, null]}
      tooltip
    >
      <Svg>
        <Bars strokeWidth={1} class="fill-gray-200 stroke-gray-400" />
        <Highlight bar={{class: "fill-accent-500 stroke-gray-600"}} strokeWidth={1} />
      </Svg>
      <Tooltip
        class="text-xs"
        contained={false}
        header={(data) => format(data.date, 'eee, MMM do')}
        let:data
      >
        <TooltipItem label="value" value={data.value} />
      </Tooltip>
    </Chart>

  </div>
</Preview>