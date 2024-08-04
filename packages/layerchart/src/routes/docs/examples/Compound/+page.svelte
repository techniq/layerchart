<script lang="ts">
  import { scaleBand } from 'd3-scale';

  import { Area, Axis, Bars, Chart, Highlight, Spline, Svg, Tooltip } from 'layerchart';

  import { formatDate, PeriodType } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';

  export let data;

  const dateSeries = createDateSeries({
    count: 30,
    min: 20,
    max: 100,
    value: 'integer',
    keys: ['value', 'baseline'],
  });
</script>

<h1>Examples</h1>

<h2>Common scale</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={dateSeries}
      x="date"
      xScale={scaleBand().padding(0.4)}
      y={['baseline', 'value']}
      yDomain={[0, null]}
      yNice={4}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'band' }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Bars y="baseline" radius={4} class="fill-primary" />
        <Area y1="value" class="fill-secondary/20" line={{ class: 'stroke-secondary' }} />
        <Highlight area />
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>
          {formatDate(data.date, PeriodType.Day)}
        </Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="baseline" value={data.baseline} />
          <Tooltip.Item label="value" value={data.value} />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Stacked Charts</h2>

<Preview {data}>
  <div class="h-[300px] grid grid-stack p-4 border rounded">
    <!-- First cahrt (bar), with different domain scale for volume -->
    <Chart
      data={data.appleTicker}
      x="date"
      xScale={scaleBand().padding(0.4)}
      y="volume"
      yNice={4}
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Bars radius={4} class="fill-surface-content/10" />
      </Svg>
    </Chart>

    <!-- Second chart (line), responsible for tooltip -->
    <Chart
      data={data.appleTicker}
      x="date"
      xScale={scaleBand().padding(0.4)}
      y={['open', 'close']}
      yNice={4}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'band' }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
          ticks={10}
        />
        <Spline y="open" class="stroke-primary" />
        <Spline y="close" class="stroke-secondary" />
        <Highlight area />
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>
          {formatDate(data.date, PeriodType.Day)}
        </Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="open" value={data.open} format="currency" />
          <Tooltip.Item label="close" value={data.close} format="currency" />
          <Tooltip.Item label="high" value={data.high} format="currency" />
          <Tooltip.Item label="low" value={data.low} format="currency" />
          <Tooltip.Item label="volume" value={data.volume} format="integer" />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>
