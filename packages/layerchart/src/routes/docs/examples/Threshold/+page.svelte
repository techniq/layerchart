<script lang="ts">
  import { scaleTime } from 'd3-scale';
  import { curveLinear, curveStepAfter } from 'd3-shape';
  import { format } from 'date-fns';
  import { formatDate, PeriodType } from '@layerstack/utils';

  import {
    Area,
    Axis,
    Chart,
    Highlight,
    Labels,
    Spline,
    Svg,
    Threshold,
    Tooltip,
  } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import CurveMenuField from '$lib/docs/CurveMenuField.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';

  let selectedCurve = curveLinear;

  const data = createDateSeries({
    count: 30,
    min: 50,
    max: 100,
    value: 'integer',
    keys: ['value', 'baseline'],
  });
</script>

<CurveMenuField bind:value={selectedCurve} />

<h1>Examples</h1>

<h2>Basic</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y={['value', 'baseline']}
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Threshold curve={selectedCurve} let:curve>
          <g slot="above" let:curve>
            <Area y0="value" y1="baseline" {curve} class="fill-success/30" />
          </g>
          <g slot="below" let:curve>
            <Area y0="value" y1="baseline" {curve} class="fill-danger/30" />
          </g>
          <Spline y="baseline" {curve} class="[stroke-dasharray:4]" />
          <Spline y="value" {curve} class="stroke-[1.5]" />
        </Threshold>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>With Tooltip and Highlight</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y={['value', 'baseline']}
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'bisect-x', findTooltipData: 'left' }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Threshold curve={curveStepAfter} let:curve>
          <g slot="above" let:curve>
            <Area y0="value" y1="baseline" {curve} class="fill-success/30" />
          </g>
          <g slot="below" let:curve>
            <Area y0="value" y1="baseline" {curve} class="fill-danger/30" />
          </g>
          <Spline y="baseline" {curve} class="[stroke-dasharray:4]" />
          <Spline y="value" {curve} class="stroke-[1.5]" />
        </Threshold>
        <Highlight area />
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{format(data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={data.value} />
          <Tooltip.Item label="baseline" value={data.baseline} />
          <Tooltip.Separator />
          <Tooltip.Item label="variance" value={data.value - data.baseline} />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>With Labels</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y={['value', 'baseline']}
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Threshold>
          <g slot="above">
            <Area y0="value" y1="baseline" class="fill-success/30" />
          </g>
          <g slot="below">
            <Area y0="value" y1="baseline" class="fill-danger/30" />
          </g>
          <Spline y="baseline" class="[stroke-dasharray:4]" />
          <Spline y="value" class="stroke-[1.5]" />
        </Threshold>
        <Labels format="integer" />
      </Svg>
    </Chart>
  </div>
</Preview>
