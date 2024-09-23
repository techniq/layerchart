<script lang="ts">
  import { scaleTime } from 'd3-scale';
  import { format } from 'date-fns';

  import { Chart, Highlight, Spline, Svg, Tooltip } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';

  const data = createDateSeries({ count: 50, min: 50, max: 100, value: 'integer' });
</script>

<h1>Examples</h1>

<h2>Basic</h2>
<Preview {data}>
  <div>
    <div class="w-[124px] h-[18px]">
      <Chart {data} x="date" xScale={scaleTime()} y="value">
        <Svg>
          <Spline class="stroke-1 stroke-primary" />
        </Svg>
      </Chart>
    </div>
  </div>
</Preview>

<h2>Basic within a paragraph</h2>
<Preview {data}>
  <div>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pretium, ligula ac sollicitudin
      ullamcorper, leo justo pretium tellus, at gravida ex quam et orci.
      <span class="w-[124px] h-[18px] inline-block">
        <Chart {data} x="date" xScale={scaleTime()} y="value">
          <Svg>
            <Spline class="stroke-1 stroke-primary" />
          </Svg>
        </Chart>
      </span> Sed ipsum justo, facilisis id tempor hendrerit, suscipit eu ipsum. Mauris ut sapien quis
      nibh volutpat venenatis. Ut viverra justo varius sapien convallis venenatis vel faucibus urna.
    </p>
  </div>
</Preview>

<h2>Basic zero axis</h2>
<Preview {data}>
  <div class="w-[124px] h-[20px] inline-block">
    <Chart {data} x="date" xScale={scaleTime()} y="value" yDomain={[0, null]}>
      <Svg>
        <Spline class="stroke-1 stroke-primary" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>With Tooltip and Highlight</h2>
<Preview {data}>
  <div class="w-[124px] h-[24px]">
    <Chart {data} x="date" xScale={scaleTime()} y="value" tooltip={{ mode: 'bisect-x' }}>
      <Svg>
        <Spline class="stroke-1 stroke-primary" />
        <Highlight points={{ r: 3, class: 'stroke-none' }} />
      </Svg>

      <Tooltip.Root class="text-xs" contained={false} let:data>
        <Tooltip.Header>{format(data.date, 'eee, MMM do')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={data.value} />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>With Tooltip and Highlight (fixed position)</h2>
<Preview {data}>
  <div class="w-[124px] h-[24px]">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      tooltip={{ mode: 'bisect-x' }}
      let:containerWidth
    >
      <Svg>
        <Spline class="stroke-1 stroke-primary" />
        <Highlight points={{ r: 3, class: 'stroke-none' }} />
      </Svg>

      <Tooltip.Root
        class="text-xs"
        contained={false}
        y={-3}
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
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Within a paragraph with Tooltip and Highlight</h2>
<Preview {data}>
  <div>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pretium, ligula ac sollicitudin
      ullamcorper, leo justo pretium tellus, at gravida ex quam et orci.
      <span class="w-[124px] h-[18px] inline-block">
        <Chart
          {data}
          x="date"
          xScale={scaleTime()}
          y="value"
          tooltip={{ mode: 'bisect-x' }}
          let:containerHeight
        >
          <Svg>
            <Spline class="stroke-1 stroke-primary" />
            <Highlight points lines />
          </Svg>

          <Tooltip.Root
            class="text-xs"
            contained={false}
            y={containerHeight + 4}
            xOffset={0}
            let:data
          >
            <Tooltip.Header>{format(data.date, 'eee, MMM do')}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="value" value={data.value} />
            </Tooltip.List>
          </Tooltip.Root>
        </Chart>
      </span> Sed ipsum justo, facilisis id tempor hendrerit, suscipit eu ipsum. Mauris ut sapien quis
      nibh volutpat venenatis. Ut viverra justo varius sapien convallis venenatis vel faucibus urna.
    </p>
  </div>
</Preview>
