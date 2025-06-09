<script lang="ts">
  import { curveStepAfter } from 'd3-shape';

  import { AreaChart, Area, Spline, Threshold, Tooltip } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import CurveMenuField from '$lib/docs/CurveMenuField.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';
  import Blockquote from '$lib/docs/Blockquote.svelte';
  import { shared } from '../../shared.svelte.js';

  let renderContext = $derived(shared.renderContext as 'svg' | 'canvas');

  let selectedCurve = $state(curveStepAfter);

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

<Blockquote>
  See also: <a href="/docs/components/AreaChart">AreaChart</a> for simplified examples
</Blockquote>

<h2>Basic</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
      {data}
      x="date"
      y={['value', 'baseline']}
      padding={{ left: 16, bottom: 24 }}
      tooltip={false}
      {renderContext}
    >
      {#snippet marks()}
        <Threshold curve={selectedCurve}>
          {#snippet above({ curve })}
            <Area y0="value" y1="baseline" {curve} class="fill-success/30" />
          {/snippet}

          {#snippet children({ curve })}
            <Spline y="baseline" {curve} class="[stroke-dasharray:4]" />
            <Spline y="value" {curve} class="stroke-[1.5]" />
          {/snippet}

          {#snippet below({ curve })}
            <Area y0="value" y1="baseline" {curve} class="fill-danger/30" />
          {/snippet}
        </Threshold>
      {/snippet}
    </AreaChart>
  </div>
</Preview>

<h2>With Tooltip and Highlight</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
      {data}
      x="date"
      y={['value', 'baseline']}
      padding={{ left: 16, bottom: 24 }}
      props={{
        highlight: { area: true, lines: false, points: false },
        tooltip: { context: { mode: 'bisect-x', findTooltipData: 'left' } },
      }}
      {renderContext}
    >
      {#snippet marks()}
        <Threshold curve={selectedCurve}>
          {#snippet above({ curve })}
            <Area y0="value" y1="baseline" {curve} class="fill-success/30" />
          {/snippet}

          {#snippet below({ curve })}
            <Area y0="value" y1="baseline" {curve} class="fill-danger/30" />
          {/snippet}

          {#snippet children({ curve })}
            <Spline y="baseline" {curve} class="[stroke-dasharray:4]" />
            <Spline y="value" {curve} class="stroke-[1.5]" />
          {/snippet}
        </Threshold>
      {/snippet}

      {#snippet tooltip({ context })}
        <Tooltip.Root {context}>
          {#snippet children({ data })}
            <Tooltip.Header value={data.date} format="day" />
            <Tooltip.List>
              <Tooltip.Item label="value" value={data.value} />
              <Tooltip.Item label="baseline" value={data.baseline} />
              <Tooltip.Separator />
              <Tooltip.Item label="variance" value={data.value - data.baseline} />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </AreaChart>
  </div>
</Preview>

<h2>With Labels</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
      {data}
      x="date"
      y={['value', 'baseline']}
      padding={{ left: 16, bottom: 24 }}
      labels
      tooltip={false}
      {renderContext}
    >
      {#snippet marks()}
        <Threshold>
          {#snippet above({ curve })}
            <Area y0="value" y1="baseline" {curve} class="fill-success/30" />
          {/snippet}

          {#snippet below({ curve })}
            <Area y0="value" y1="baseline" {curve} class="fill-danger/30" />
          {/snippet}

          {#snippet children({ curve })}
            <Spline y="baseline" {curve} class="[stroke-dasharray:4]" />
            <Spline y="value" {curve} class="stroke-[1.5]" />
          {/snippet}
        </Threshold>
      {/snippet}
    </AreaChart>
  </div>
</Preview>
