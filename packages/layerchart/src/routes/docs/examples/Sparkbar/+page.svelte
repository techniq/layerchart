<script lang="ts">
  import { scaleBand } from 'd3-scale';
  import { format } from 'date-fns';
  import { cls } from 'svelte-ux';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Bars from '$lib/components/Bars.svelte';
  import Highlight from '$lib/components/Highlight.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';

  const data = createDateSeries({
    count: 30,
    min: 20,
    max: 100,
    value: 'integer',
    keys: ['value', 'baseline'],
  });
  const negativeData = createDateSeries({ count: 30, min: -20, max: 50, value: 'integer' });
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview {data}>
  <div class="w-[125px] h-[18px]">
    <Chart {data} x="date" xScale={scaleBand()} y="value" yDomain={[0, null]}>
      <Svg>
        <Bars strokeWidth={1} class="fill-primary/20 stroke-primary" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Basic within a paragraph</h2>
<Preview {data}>
  <div>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pretium, ligula ac sollicitudin
      ullamcorper, leo justo pretium tellus, at gravida ex quam et orci.
      <span class="w-[125px] h-[18px] inline-block">
        <Chart {data} x="date" xScale={scaleBand()} y="value" yDomain={[0, null]}>
          <Svg>
            <Bars strokeWidth={1} class="fill-primary/20 stroke-primary" />
          </Svg>
        </Chart>
      </span> Sed ipsum justo, facilisis id tempor hendrerit, suscipit eu ipsum. Mauris ut sapien quis
      nibh volutpat venenatis. Ut viverra justo varius sapien convallis venenatis vel faucibus urna.
    </p>
  </div>
</Preview>

<h2>Basic negative data</h2>

<Preview data={negativeData}>
  <div class="w-[125px] h-[18px]">
    <Chart data={negativeData} x="date" xScale={scaleBand()} y="value">
      <Svg>
        <Bars strokeWidth={1} class="fill-primary/20 stroke-primary" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>With Tooltip and Highlight</h2>

<Preview {data}>
  <div class="w-[125px] h-[18px]">
    <Chart {data} x="date" xScale={scaleBand()} y="value" yDomain={[0, null]} tooltip>
      <Svg>
        <Bars strokeWidth={1} class="fill-primary/20 stroke-primary" />
        <Highlight bar={{ strokeWidth: 1 }} />
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

<h2>With Tooltip and Highlight (fixed position)</h2>

<Preview {data}>
  <div class="w-[125px] h-[18px]">
    <Chart
      {data}
      x="date"
      xScale={scaleBand()}
      y="value"
      yDomain={[0, null]}
      tooltip={{ mode: 'bisect-x' }}
      let:containerWidth
    >
      <Svg>
        <Bars strokeWidth={1} class="fill-primary/20 stroke-primary" />
        <Highlight bar={{ strokeWidth: 1 }} />
      </Svg>

      <Tooltip
        class="text-xs"
        contained={false}
        y={-10}
        x={containerWidth + 8}
        variant="none"
        let:data
      >
        <div class="whitespace-nowrap">
          {format(data.date, 'eee, MMM do')}
        </div>
        <div class="font-semibold">
          {data.value}
        </div>
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Basic within a paragraph with Tooltip and Highlight</h2>
<Preview {data}>
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
          tooltip={{ mode: 'bisect-x' }}
          let:containerHeight
        >
          <Svg>
            <Bars strokeWidth={1} class="fill-primary/20 stroke-primary" />
            <Highlight bar={{ strokeWidth: 1 }} />
          </Svg>
          <Tooltip
            class="text-xs"
            contained={false}
            header={(data) => format(data.date, 'eee, MMM do')}
            y={containerHeight + 4}
            xOffset={0}
            let:data
          >
            <TooltipItem label="value" value={data.value} />
          </Tooltip>
        </Chart>
      </span> Sed ipsum justo, facilisis id tempor hendrerit, suscipit eu ipsum. Mauris ut sapien quis
      nibh volutpat venenatis. Ut viverra justo varius sapien convallis venenatis vel faucibus urna.
    </p>
  </div>
</Preview>
