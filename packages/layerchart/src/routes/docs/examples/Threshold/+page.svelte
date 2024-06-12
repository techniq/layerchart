<script lang="ts">
  import { scaleTime } from 'd3-scale';
  import { curveLinear, curveStepAfter } from 'd3-shape';
  import { format } from 'date-fns';
  import { formatDate, PeriodType } from 'svelte-ux';

  import { Chart, Svg } from 'layerchart';
  import Area from '$lib/components/Area.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Highlight from '$lib/components/Highlight.svelte';
  import Labels from '$lib/components/Labels.svelte';
  import Spline from '$lib/components/Spline.svelte';
  import Threshold from '$lib/components/Threshold.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';
  import TooltipSeparator from '$lib/components/TooltipSeparator.svelte';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';
  import CurveMenuField from '$lib/docs/CurveMenuField.svelte';

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
        <Threshold curve={selectedCurve}>
          <g slot="pathAbove" let:areaPathData let:clipPath let:linePathData>
            <Spline pathData={linePathData} stroke-width="1.5" />
            <Area pathData={areaPathData} {clipPath} class="fill-success/30" />
          </g>
          <g slot="pathBelow" let:areaPathData let:clipPath let:linePathData>
            <Spline pathData={linePathData} stroke-dasharray="4" />
            <Area pathData={areaPathData} {clipPath} class="fill-danger/30" />
          </g>
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
        <Threshold curve={curveStepAfter}>
          <g slot="pathAbove" let:areaPathData let:clipPath let:linePathData>
            <Spline pathData={linePathData} color="black" width="1.5" />
            <Area pathData={areaPathData} {clipPath} class="fill-success/30" />
          </g>
          <g slot="pathBelow" let:areaPathData let:clipPath let:linePathData>
            <Spline pathData={linePathData} color="black" width="1" stroke-dasharray="4" />
            <Area pathData={areaPathData} {clipPath} class="fill-danger/30" />
          </g>
        </Threshold>
        <Highlight area />
      </Svg>
      <Tooltip header={(data) => format(data.date, 'eee, MMMM do')} let:data>
        <TooltipItem label="value" value={data.value} />
        <TooltipItem label="baseline" value={data.baseline} />
        <TooltipSeparator />
        <TooltipItem label="variance" value={data.value - data.baseline} />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>With Labels</h2>

<!-- TODO: Show label for both value and baseline (above and below) -->

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
          <g slot="pathAbove" let:areaPathData let:clipPath let:linePathData>
            <Spline pathData={linePathData} color="black" width="1.5" />
            <Area pathData={areaPathData} {clipPath} class="fill-success/30" />
          </g>
          <g slot="pathBelow" let:areaPathData let:clipPath let:linePathData>
            <Spline pathData={linePathData} color="black" width="1" stroke-dasharray="4" />
            <Area pathData={areaPathData} {clipPath} class="fill-danger/30" />
          </g>
        </Threshold>
        <Labels format="integer" />
      </Svg>
    </Chart>
  </div>
</Preview>
