<script lang="ts">
  import { curveStepAfter } from 'd3-shape';
  import { format } from 'date-fns';

  import { AreaChart, Area, Spline, Threshold, Tooltip } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import CurveMenuField from '$lib/docs/CurveMenuField.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';

  let selectedCurve = curveStepAfter;

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
    <AreaChart
      {data}
      x="date"
      y={['value', 'baseline']}
      padding={{ left: 16, bottom: 24 }}
      tooltip={false}
    >
      <svelte:fragment slot="marks">
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
      </svelte:fragment>
    </AreaChart>
  </div>
</Preview>

<h2>With Tooltip and Highlight</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart
      {data}
      x="date"
      y={['value', 'baseline']}
      padding={{ left: 16, bottom: 24 }}
      props={{ highlight: { area: true, lines: false, points: false } }}
      tooltip={{ mode: 'bisect-x', findTooltipData: 'left' }}
    >
      <svelte:fragment slot="marks">
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
      </svelte:fragment>

      <svelte:fragment slot="tooltip">
        <Tooltip.Root let:data>
          <Tooltip.Header>{format(data.date, 'eee, MMMM do')}</Tooltip.Header>
          <Tooltip.List>
            <Tooltip.Item label="value" value={data.value} />
            <Tooltip.Item label="baseline" value={data.baseline} />
            <Tooltip.Separator />
            <Tooltip.Item label="variance" value={data.value - data.baseline} />
          </Tooltip.List>
        </Tooltip.Root>
      </svelte:fragment>
    </AreaChart>
  </div>
</Preview>

<h2>With Labels</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart
      {data}
      x="date"
      y={['value', 'baseline']}
      padding={{ left: 16, bottom: 24 }}
      labels
      tooltip={false}
    >
      <svelte:fragment slot="marks">
        <Threshold let:curve>
          <g slot="above" let:curve>
            <Area y0="value" y1="baseline" {curve} class="fill-success/30" />
          </g>
          <g slot="below" let:curve>
            <Area y0="value" y1="baseline" {curve} class="fill-danger/30" />
          </g>
          <Spline y="baseline" {curve} class="[stroke-dasharray:4]" />
          <Spline y="value" {curve} class="stroke-[1.5]" />
        </Threshold>
      </svelte:fragment>
    </AreaChart>
  </div>
</Preview>
