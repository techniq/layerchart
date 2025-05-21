<script lang="ts">
  import { scaleLinear, scaleTime, scaleBand, scaleLog } from 'd3-scale';
  import { range } from 'd3-array';
  import { timeDay, timeHour, timeMinute, timeMonth, timeSecond, timeYear } from 'd3-time';
  import { Field, RangeField, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { format, PeriodType } from '@layerstack/utils';
  import { MediaQueryPresets } from '@layerstack/svelte-state';

  import { Axis, Chart, Frame, Layer, Rule, Text, Grid, asAny } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';

  import { createDateSeries } from '$lib/utils/genData.js';
  import Blockquote from '$lib/docs/Blockquote.svelte';

  const largeData = createDateSeries({ count: 100, min: 50, max: 100, value: 'integer' });

  const now = new Date();

  let initialXDomain = [timeYear.offset(now, -4), now];
  let xDomain = $state([timeYear.offset(now, -4), now]);

  const timeScaleExamples = [
    { label: '5 years', domain: [timeYear.offset(now, -5), now] },
    { label: '1 year', domain: [timeYear.offset(now, -1), now] },
    { label: '6 months', domain: [timeMonth.offset(now, -6), now] },
    { label: '90 days', domain: [timeDay.offset(now, -90), now] },
    { label: '30 days', domain: [timeDay.offset(now, -30), now] },
    { label: '10 days', domain: [timeDay.offset(now, -10), now] },
    { label: '7 days', domain: [timeDay.offset(now, -7), now] },
    { label: '3 days', domain: [timeDay.offset(now, -3), now] },
    { label: '24 hours', domain: [timeHour.offset(now, -24), now] },
    { label: '12 hours', domain: [timeHour.offset(now, -12), now] },
    { label: '1 hour', domain: [timeHour.offset(now, -1), now] },
    { label: '1 minute', domain: [timeMinute.offset(now, -1), now] },
    { label: '1 second', domain: [timeSecond.offset(now, -1), now] },
  ];

  let tickSpacing = $state(80); // x-axis default

  let renderContext: 'svg' | 'canvas' = $state('svg');
  let debug = $state(false);
  const { mdScreen } = new MediaQueryPresets();
</script>

<h1>Examples</h1>

<div class="flex gap-2">
  <Field label="Render context" class="grow">
    <ToggleGroup bind:value={renderContext} variant="outline">
      <ToggleOption value="svg">Svg</ToggleOption>
      <ToggleOption value="canvas">Canvas</ToggleOption>
    </ToggleGroup>
  </Field>
</div>

<h2>left / bottom placement</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>top / right placement</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis placement="top" rule />
        <Axis placement="right" rule />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>rule (left/bottom placement)</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>rule (top/right placement)</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis placement="top" rule />
        <Axis placement="right" rule />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>grid</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis placement="bottom" grid />
        <Axis placement="left" grid />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>dashed grid lines</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis placement="bottom" />
        <Axis placement="left" grid={{ style: 'stroke-dasharray: 2' }} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>multiple axis grids with single rule</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis placement="left" grid />
        <Axis placement="bottom" grid rule />
      </Layer>
    </Chart>
  </div>
</Preview>

<Blockquote>Axis with rule should be rendered last</Blockquote>

<h2>multiple axis grids and rules</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis placement="left" grid />
        <Axis placement="bottom" grid rule />
        <Rule x="left" />
      </Layer>
    </Chart>
  </div>
</Preview>

<Blockquote>Top-most axis must have separate rule due to SVG rendering order</Blockquote>

<h2>multiple axis grids and rules (separate grid)</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Grid x y />
        <Axis placement="left" rule />
        <Axis placement="bottom" rule />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Arrow markers</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis placement="left" grid rule={{ markerEnd: 'arrow' }} />
        <Axis placement="bottom" grid rule={{ markerEnd: 'arrow' }} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>tick label styling</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ top: 20, bottom: 36, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis
          placement="bottom"
          rule
          classes={{
            rule: 'stroke-danger',
            tick: 'stroke-danger/50',
            tickLabel: 'fill-danger font-semibold',
          }}
        />
        <Axis placement="left" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>rotated tick labels and styling</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ top: 20, bottom: 36, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis
          placement="bottom"
          rule={{ class: 'stroke-danger' }}
          tickLabelProps={{
            rotate: 315,
            textAnchor: 'end',
            class: 'fill-danger font-semibold',
          }}
        />
        <Axis placement="left" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Remove ticks hashes</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis placement="bottom" rule tickLength={0} />
        <Axis placement="left" rule tickLength={0} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>show only first/last ticks with alignment</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis
          placement="bottom"
          rule
          ticks={(scale) => scale.domain()}
          format={(d) => format(d, PeriodType.Day, { variant: 'long' })}
        >
          {#snippet tickLabel({ props, index })}
            <Text {...props} textAnchor={index === 0 ? 'start' : 'end'} />
          {/snippet}
        </Axis>
        <Axis placement="left" rule ticks={(scale) => scale.domain()} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>integer-only ticks</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 2]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis placement="bottom" rule />
        <Axis
          placement="left"
          rule
          ticks={(scale) => scale.ticks?.().filter(Number.isInteger)}
          format="integer"
        />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>explicit ticks</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule ticks={[0, 50, 100]} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Inject tick value</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule ticks={(scale) => [45, ...(scale.ticks?.() ?? [])]} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>tick count</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule ticks={20} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>tick count (responsive)</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis placement="bottom" rule ticks={mdScreen.current ? 10 : 5} />
        <Axis placement="left" rule />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>tick time interval</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis placement="bottom" rule ticks={{ interval: timeDay.every(3) }} />
        <Axis placement="left" rule />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>remove default tick count</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule ticks={null} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>label next to hash</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis
          placement="bottom"
          rule={{ class: 'stroke-surface-content/10' }}
          tickLabelProps={{ textAnchor: 'start', dx: 8, dy: 4 }}
          ticks={(scale) => scale.ticks?.().slice(0, -1)}
          tickLength={22}
        />
        <Axis placement="left" rule />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Hide `0` tick via ticks</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule ticks={(scale) => scale.ticks?.().filter((d) => d !== 0)} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Hide `0` tick via format</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule format={(v) => v || ''} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Override axis ticks with custom scale</h2>

<Preview data={largeData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={largeData}
      x="date"
      xScale={scaleBand()}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis
          placement="bottom"
          rule
          ticks={(scale) => scaleTime(scale.domain(), scale.range()).ticks()}
          format={PeriodType.Day}
        />
        <Axis placement="left" rule />
      </Layer>
    </Chart>
  </div>
</Preview>

<div class="grid grid-cols-[1fr_auto] gap-2 items-end">
  <h2>Axis label placements (top/bottom)</h2>

  <div class="mb-2 flex gap-6">
    <Field label="Debug:" dense labelPlacement="left" let:id>
      <Switch {id} bind:checked={debug} />
    </Field>
  </div>
</div>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 32, bottom: 32, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        {#if debug}
          <Frame class="fill-danger/5" />
          <Frame class="fill-danger/5" full />
        {/if}

        <Axis label="top start" placement="top" labelPlacement="start" rule />
        <Axis label="top middle" placement="top" labelPlacement="middle" rule />
        <Axis label="top end" placement="top" labelPlacement="end" rule />

        <Axis label="bottom start" placement="bottom" labelPlacement="start" rule />
        <Axis label="bottom middle" placement="bottom" labelPlacement="middle" rule />
        <Axis label="bottom end" placement="bottom" labelPlacement="end" rule />
      </Layer>
    </Chart>
  </div>
</Preview>

<div class="grid grid-cols-[1fr_auto] gap-2 items-end">
  <h2>Axis label placements (left/right)</h2>

  <div class="mb-2 flex gap-6">
    <Field label="Debug:" dense labelPlacement="left" let:id>
      <Switch {id} bind:checked={debug} />
    </Field>
  </div>
</div>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 32, right: 32 }}
    >
      <Layer type={renderContext}>
        {#if debug}
          <Frame class="fill-danger/5" />
          <Frame class="fill-danger/5" full />
        {/if}

        <Axis label="left start" placement="left" labelPlacement="start" rule />
        <Axis label="left middle" placement="left" labelPlacement="middle" rule />
        <Axis label="left end" placement="left" labelPlacement="end" rule />

        <Axis label="right start" placement="right" labelPlacement="start" rule />
        <Axis label="right middle" placement="right" labelPlacement="middle" rule />
        <Axis label="right end" placement="right" labelPlacement="end" rule />
      </Layer>
    </Chart>
  </div>
</Preview>

<div class="grid grid-cols-[1fr_auto] gap-2 items-end">
  <h2>Multiple axis with same placement</h2>

  <div class="mb-2 flex gap-6">
    <Field label="Debug:" dense labelPlacement="left" let:id>
      <Switch {id} bind:checked={debug} />
    </Field>
  </div>
</div>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ right: 90 }}
    >
      {#snippet children({ context })}
        <Layer type={renderContext}>
          {#if debug}
            <Frame class="fill-danger/5" />
            <Frame class="fill-danger/5" full />
          {/if}

          <Axis
            label="Celsius"
            scale={scaleLinear([0, 100], [context.height, 0])}
            placement="right"
            rule
            labelProps={{ dx: -60 }}
          />
          <Axis
            label="Fahrenheit"
            scale={scaleLinear([32, 212], [context.height, 0])}
            ticks={range(0, 100 + 1, 10).map((x) => x * (9 / 5) + 32)}
            placement="right"
            rule
            class="translate-x-[50px]"
            labelProps={{ dx: -50 }}
          />
        </Layer>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>radial rule</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      radial
    >
      <Layer type={renderContext} center>
        <Axis placement="radius" rule />
        <Axis placement="angle" rule ticks={(scale) => scale.ticks?.().splice(1)} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>radial grid</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yDomain={[0, 100]}
      radial
    >
      <Layer type={renderContext} center>
        <Axis placement="radius" grid />
        <Axis placement="angle" grid ticks={(scale) => scale.ticks?.().splice(1)} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Log scale</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      x="date"
      xScale={scaleTime()}
      xDomain={[timeDay.offset(now, -10), now]}
      y="value"
      yScale={scaleLog()}
      yDomain={[1, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={renderContext}>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
      </Layer>
    </Chart>
  </div>
</Preview>

<div class="flex gap-2 mb-1/2">
  <h2 class="grow">Time scale (ranges)</h2>
  <RangeField label="tickSpacing" labelPlacement="left" bind:value={tickSpacing} max={300} />
</div>

<Preview>
  <div class="grid gap-3">
    {#each timeScaleExamples as example}
      <div class="resize-x overflow-auto">
        <div class="text-sm mb-1">{example.label}</div>
        <div class="h-[100px] p-4 border rounded-sm">
          <Chart
            xScale={scaleTime()}
            xDomain={example.domain}
            padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Layer type={renderContext}>
              <Axis placement="bottom" rule grid {tickSpacing} />
            </Layer>
          </Chart>
        </div>
      </div>
    {/each}
  </div>
</Preview>

<div class="flex gap-2 mb-1/2">
  <h2 class="grow">Time scale (ranges) with multiline ticks</h2>
  <RangeField label="tickSpacing" labelPlacement="left" bind:value={tickSpacing} max={300} />
</div>

<Preview>
  <div class="grid gap-3">
    {#each timeScaleExamples as example}
      <div class="resize-x overflow-auto">
        <div class="text-sm mb-1">{example.label}</div>
        <div class="h-[100px] p-4 border rounded-sm">
          <Chart
            xScale={scaleTime()}
            xDomain={example.domain}
            padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Layer type={renderContext}>
              <Axis placement="bottom" rule grid tickMultiline {tickSpacing} />
            </Layer>
          </Chart>
        </div>
      </div>
    {/each}
  </div>
</Preview>

<div class="flex gap-2 mb-1/2">
  <h2 class="grow">Time scale (brush)</h2>
  <RangeField label="tickSpacing" labelPlacement="left" bind:value={tickSpacing} max={300} />
</div>

<Preview>
  <div class="p-4 border rounded-sm resize-x overflow-auto">
    <div class="h-[300px]">
      <Chart
        x="date"
        xScale={scaleTime()}
        {xDomain}
        y="value"
        yDomain={[0, 100]}
        padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
        brush={{
          resetOnEnd: true,
          onBrushEnd: (e) => {
            xDomain = asAny(e.xDomain);
          },
        }}
      >
        <Layer type={renderContext}>
          <Axis placement="bottom" rule grid {tickSpacing} />
          <Axis placement="left" />
        </Layer>
      </Chart>
    </div>

    <div class="h-[80px]">
      <Chart
        x="date"
        xScale={scaleTime()}
        xDomain={initialXDomain}
        y="value"
        padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
        brush={{
          mode: 'separated',
          xDomain,
          onChange: (e) => {
            xDomain = asAny(e.xDomain);
          },
        }}
      >
        <Layer type={renderContext}>
          <Axis placement="bottom" rule grid ticks={{ interval: timeYear.every(1) }} />
        </Layer>
      </Chart>
    </div>
  </div>
</Preview>

<div class="flex gap-2 mb-1/2">
  <h2 class="grow">Time scale (brush) with multiline ticks</h2>
  <RangeField label="tickSpacing" labelPlacement="left" bind:value={tickSpacing} max={300} />
</div>

<Preview>
  <div class="p-4 border rounded-sm resize-x overflow-auto">
    <div class="h-[300px]">
      <Chart
        x="date"
        xScale={scaleTime()}
        {xDomain}
        y="value"
        yDomain={[0, 100]}
        padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
        brush={{
          resetOnEnd: true,
          onBrushEnd: (e) => {
            xDomain = asAny(e.xDomain);
          },
        }}
      >
        <Layer type={renderContext}>
          <Axis placement="bottom" rule grid tickMultiline {tickSpacing} />
          <Axis placement="left" />
        </Layer>
      </Chart>
    </div>

    <div class="h-[80px]">
      <Chart
        x="date"
        xScale={scaleTime()}
        xDomain={initialXDomain}
        y="value"
        padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
        brush={{
          mode: 'separated',
          xDomain,
          onChange: (e) => {
            xDomain = asAny(e.xDomain);
          },
        }}
      >
        <Layer type={renderContext}>
          <Axis placement="bottom" rule grid ticks={{ interval: timeYear.every(1) }} />
        </Layer>
      </Chart>
    </div>
  </div>
</Preview>
