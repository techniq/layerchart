<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { scaleLinear, scaleTime, scaleBand, scaleLog } from 'd3-scale';
  import { range } from 'd3-array';
  import { Axis, Chart, Frame, Layer, Rule, Text, Grid, asAny, getSettings } from 'layerchart';
  import {
    timeDay,
    timeHour,
    timeMinute,
    timeMonth,
    timeSecond,
    timeYear,
    timeMillisecond,
    type TimeInterval,
  } from 'd3-time';
  import { RangeField } from 'svelte-ux';
  import { startOfInterval } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';

  import { createDateSeries } from '$lib/utils/genData.js';
  import Blockquote from '$lib/docs/Blockquote.svelte';

  const largeData = createDateSeries({ count: 100, min: 50, max: 100, value: 'integer' });

  const today = startOfInterval('day', new Date());

  let initialXDomain = [timeYear.offset(today, -4), today];
  let xDomain = $state([timeYear.offset(today, -4), today]);

  const timeScaleExamples = [
    {
      label: '5 years',
      domain: [timeYear.offset(today, -5), today],
      interval: timeYear.every(1),
      format: 'year',
    },
    {
      label: '1 year',
      domain: [timeYear.offset(today, -1), today],
      interval: timeMonth.every(1),
      format: { type: 'month', options: { variant: 'short' } },
    },
    {
      label: '6 months',
      domain: [timeMonth.offset(today, -6), today],
      interval: timeMonth.every(1),
      format: { type: 'month', options: { variant: 'short' } },
    },
    {
      label: '90 days',
      domain: [timeDay.offset(today, -90), today],
      interval: timeDay.every(7),
      format: { type: 'day', options: { variant: 'short' } },
    },
    {
      label: '30 days',
      domain: [timeDay.offset(today, -30), today],
      interval: timeDay.every(1),
      format: { type: 'day', options: { variant: 'short' } },
    },
    {
      label: '10 days',
      domain: [timeDay.offset(today, -10), today],
      interval: timeDay.every(1),
      format: { type: 'day', options: { variant: 'short' } },
    },
    {
      label: '7 days',
      domain: [timeDay.offset(today, -7), today],
      interval: timeDay.every(1),
      format: { type: 'day', options: { variant: 'short' } },
    },
    {
      label: '3 days',
      domain: [timeDay.offset(today, -3), today],
      interval: timeHour.every(4),
      format: { type: 'day', options: { variant: 'short' } },
    },
    {
      label: '24 hours',
      domain: [timeHour.offset(today, -24), today],
      interval: timeHour.every(1),
      format: 'hour',
    },
    {
      label: '12 hours',
      domain: [timeHour.offset(today, -12), today],
      interval: timeHour.every(1),
      format: 'hour',
    },
    {
      label: '1 hour',
      domain: [timeHour.offset(today, -1), today],
      interval: timeMinute.every(5),
      format: 'minute',
    },
    {
      label: '1 minute',
      domain: [timeMinute.offset(today, -1), today],
      interval: timeSecond.every(10),
      format: 'second',
    },
    {
      label: '1 second',
      domain: [timeSecond.offset(today, -1), today],
      interval: timeMillisecond.every(100),
      format: 'millisecond',
    },
  ] as {
    label: string;
    domain: [Date, Date];
    interval: TimeInterval;
    format?: ComponentProps<typeof Axis>['format'];
  }[];

  let tickSpacing = $state(80); // x-axis default

  let settings = getSettings();
  let debug = $derived(settings.debug);
</script>

<h1>Examples</h1>

<h2>left / bottom placement</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      xDomain={[timeDay.offset(today, -10), today]}
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer>
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
      xDomain={[timeDay.offset(today, -10), today]}
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer>
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
      xDomain={[timeDay.offset(today, -10), today]}
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer>
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
      xDomain={[timeDay.offset(today, -10), today]}
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer>
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
      xDomain={[timeDay.offset(today, -10), today]}
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer>
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
      xDomain={[timeDay.offset(today, -10), today]}
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer>
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
      xDomain={[timeDay.offset(today, -10), today]}
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer>
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
      xDomain={[timeDay.offset(today, -10), today]}
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer>
        <Axis placement="left" grid />
        <Axis placement="bottom" grid rule />
        <Rule x="$left" />
      </Layer>
    </Chart>
  </div>
</Preview>

<Blockquote>Top-most axis must have separate rule due to SVG rendering order</Blockquote>

<h2>multiple axis grids and rules (separate grid)</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      xDomain={[timeDay.offset(today, -10), today]}
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer>
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
      xDomain={[timeDay.offset(today, -10), today]}
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer>
        <Axis placement="left" grid rule={{ markerEnd: 'arrow' }} />
        <Axis placement="bottom" grid rule={{ markerEnd: 'arrow' }} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>tick label styling</h2>

<Preview>
  <div class="h-[80px] p-4 border rounded-sm">
    <Chart xDomain={[timeDay.offset(today, -10), today]} padding={{ bottom: 24 }}>
      <Layer>
        <Axis
          placement="bottom"
          rule
          classes={{
            rule: 'stroke-danger',
            tick: 'stroke-danger/50',
            tickLabel: 'fill-danger font-semibold',
          }}
        />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>rotated tick labels and styling</h2>

<Preview>
  <div class="h-[80px] p-4 border rounded-sm">
    <Chart xDomain={[timeDay.offset(today, -10), today]} padding={{ bottom: 24 }}>
      <Layer>
        <Axis
          placement="bottom"
          rule
          tickLabelProps={{
            rotate: 315,
            textAnchor: 'end',
          }}
        />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Remove ticks hashes</h2>

<Preview>
  <div class="h-[80px] p-4 border rounded-sm">
    <Chart xDomain={[timeDay.offset(today, -10), today]} padding={{ bottom: 24 }}>
      <Layer>
        <Axis placement="bottom" rule tickMarks={false} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>show only first/last ticks with alignment</h2>

<Preview>
  <div class="h-[200px] p-4 border rounded-sm">
    <Chart
      xDomain={[timeDay.offset(today, -10), today]}
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer>
        <Axis
          placement="bottom"
          rule
          ticks={(scale) => scale.domain()}
          format={{ type: 'day', options: { variant: 'long' } }}
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

<h2>integer-only ticks via filter</h2>

<Preview>
  <div class="h-[80px] p-4 border rounded-sm">
    <Chart xDomain={[0, 2]} padding={{ bottom: 24 }}>
      <Layer>
        <Axis placement="bottom" rule ticks={(scale) => scale.ticks?.().filter(Number.isInteger)} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>integer-only ticks via format</h2>

<Preview>
  <div class="h-[80px] p-4 border rounded-sm">
    <Chart xDomain={[0, 2]} padding={{ bottom: 24 }}>
      <Layer>
        <Axis placement="bottom" rule format="integer" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>explicit ticks</h2>

<Preview>
  <div class="h-[80px] p-4 border rounded-sm">
    <Chart xDomain={[0, 100]} padding={{ bottom: 24 }}>
      <Layer>
        <Axis placement="bottom" rule ticks={[0, 50, 100]} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Inject tick value</h2>

<Preview>
  <div class="h-[80px] p-4 border rounded-sm">
    <Chart xDomain={[0, 100]} padding={{ bottom: 24 }}>
      <Layer>
        <Axis placement="bottom" rule ticks={(scale) => [45, ...(scale.ticks?.() ?? [])]} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>tick count</h2>

<Preview>
  <div class="h-[80px] p-4 border rounded-sm">
    <Chart xDomain={[0, 100]} padding={{ bottom: 24 }}>
      <Layer>
        <Axis placement="bottom" rule ticks={20} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>tick spacing</h2>

<Preview>
  <div class="h-[80px] p-4 border rounded-sm">
    <Chart xDomain={[0, 100]} padding={{ bottom: 24 }}>
      <Layer>
        <Axis placement="bottom" rule tickSpacing={200} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>label next to hash</h2>

<Preview>
  <div class="h-[80px] p-4 border rounded-sm">
    <Chart xDomain={[timeDay.offset(today, -10), today]} padding={{ bottom: 24 }}>
      <Layer>
        <Axis
          placement="bottom"
          rule
          tickLabelProps={{ textAnchor: 'start', dx: 8, dy: 4 }}
          ticks={(scale) => scale.ticks?.().slice(0, -1)}
          tickLength={22}
        />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Hide `0` tick via ticks</h2>

<Preview>
  <div class="h-[80px] p-4 border rounded-sm">
    <Chart xDomain={[0, 100]} padding={{ bottom: 24 }}>
      <Layer>
        <Axis placement="bottom" rule ticks={(scale) => scale.ticks?.().filter((d) => d !== 0)} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Hide `0` tick via format</h2>

<Preview>
  <div class="h-[80px] p-4 border rounded-sm">
    <Chart xDomain={[0, 100]} padding={{ bottom: 24 }}>
      <Layer>
        <Axis placement="bottom" rule format={(v) => v || ''} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Override axis ticks with custom scale</h2>

<Preview data={largeData}>
  <div class="h-[80px] p-4 border rounded-sm resize-x overflow-auto">
    <Chart data={largeData} x="date" xScale={scaleBand()} y="value" padding={{ bottom: 24 }}>
      <Layer>
        <Axis
          placement="bottom"
          rule
          ticks={(scale) => scaleTime(scale.domain(), scale.range()).ticks(scale.range()[1] / 80)}
        />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Axis label placements (top/bottom)</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      xDomain={[timeDay.offset(today, -10), today]}
      padding={{ top: 40, bottom: 40, left: 20, right: 20 }}
    >
      <Layer>
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

<h2>Axis label placements (left/right)</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart yDomain={[0, 100]} padding={{ top: 24, bottom: 24, left: 40, right: 40 }}>
      <Layer>
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

<h2>Multiple time axis with same placement (bottom)</h2>

<Preview>
  <div class="h-[80px] p-4 border rounded-sm">
    <Chart xDomain={[timeYear.offset(today, -2), today]} padding={{ bottom: 30 }}>
      <Layer>
        {#if debug}
          <Frame class="fill-danger/5" />
          <Frame class="fill-danger/5" full />
        {/if}

        <Axis
          placement="bottom"
          ticks={{ interval: timeMonth.every(3) }}
          format={(d) => 'Q' + (d.getMonth() / 3 + 1)}
          rule
        />
        <Axis
          placement="bottom"
          ticks={{ interval: timeYear.every(1) }}
          tickLength={0}
          tickLabelProps={{ dy: 20, class: 'text-sm' }}
        />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Multiline labels with format (\n)</h2>

<Preview>
  <div class="h-[80px] p-4 border rounded-sm">
    <Chart xDomain={[timeYear.offset(today, -2), today]} padding={{ bottom: 30 }}>
      <Layer>
        {#if debug}
          <Frame class="fill-danger/5" />
          <Frame class="fill-danger/5" full />
        {/if}

        <Axis
          placement="bottom"
          ticks={{ interval: timeMonth.every(3) }}
          format={(d) =>
            'Q' + (d.getMonth() / 3 + 1) + (d.getMonth() === 0 ? '\n' + d.getFullYear() : '')}
          rule
        />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Multiple different axis with same placement (right)</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart yDomain={[0, 100]} padding={{ right: 90 }}>
      {#snippet children({ context })}
        <Layer>
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
    <Chart xDomain={[timeDay.offset(today, -10), today]} yDomain={[0, 100]} radial>
      <Layer center>
        <Axis placement="radius" rule />
        <Axis placement="angle" rule />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>radial grid</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart xDomain={[timeDay.offset(today, -10), today]} yDomain={[0, 100]} radial>
      <Layer center>
        <Axis placement="radius" grid />
        <Axis placement="angle" grid />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Log scale</h2>

<Preview>
  <div class="h-[80px] p-4 border rounded-sm">
    <Chart xScale={scaleLog()} xDomain={[1, 100]} padding={{ bottom: 24 }}>
      <Layer>
        <Axis placement="bottom" rule />
      </Layer>
    </Chart>
  </div>
</Preview>

<div class="flex gap-2 mb-1/2">
  <h2 class="grow">Time scale (auto)</h2>
  <RangeField
    label="tickSpacing"
    labelPlacement="left"
    bind:value={tickSpacing}
    min={10}
    max={300}
    step={10}
  />
</div>

<Preview>
  <div class="grid gap-3">
    {#each timeScaleExamples as example}
      <div class="resize-x overflow-auto">
        <div class="text-sm mb-1">{example.label}</div>
        <div class="h-[100px] p-4 border rounded-sm">
          <Chart xDomain={example.domain} padding={{ top: 20, bottom: 20, left: 20, right: 20 }}>
            <Layer>
              <Axis placement="bottom" rule grid {tickSpacing} />
            </Layer>
          </Chart>
        </div>
      </div>
    {/each}
  </div>
</Preview>

<div class="flex gap-2 mb-1/2">
  <h2 class="grow">Time scale (auto) with multiline ticks</h2>
  <RangeField
    label="tickSpacing"
    labelPlacement="left"
    bind:value={tickSpacing}
    min={10}
    max={300}
    step={10}
  />
</div>

<Preview>
  <div class="grid gap-3">
    {#each timeScaleExamples as example}
      <div class="resize-x overflow-auto">
        <div class="text-sm mb-1">{example.label}</div>
        <div class="h-[100px] p-4 border rounded-sm">
          <Chart xDomain={example.domain} padding={{ top: 20, bottom: 20, left: 20, right: 20 }}>
            <Layer>
              <Axis placement="top" rule grid tickMultiline {tickSpacing} />
              <Axis placement="bottom" rule grid tickMultiline {tickSpacing} />
            </Layer>
          </Chart>
        </div>
      </div>
    {/each}
  </div>
</Preview>

<div class="flex gap-2 mb-1/2">
  <h2 class="grow">Time scale (auto) with format (filtering)</h2>
  <RangeField
    label="tickSpacing"
    labelPlacement="left"
    bind:value={tickSpacing}
    min={10}
    max={300}
    step={10}
  />
</div>

<Preview>
  <div class="grid gap-3">
    {#each timeScaleExamples as example}
      <div class="resize-x overflow-auto">
        <div class="text-sm mb-1">{example.label}</div>
        <div class="h-[100px] p-4 border rounded-sm">
          <Chart xDomain={example.domain} padding={{ top: 20, bottom: 20, left: 20, right: 20 }}>
            <Layer>
              <Axis placement="bottom" rule grid {tickSpacing} format={example.format} />
            </Layer>
          </Chart>
        </div>
      </div>
    {/each}
  </div>
</Preview>

<h2>Time scale (explicit intervals)</h2>

<Preview>
  <div class="grid gap-3">
    {#each timeScaleExamples as example}
      <div class="resize-x overflow-auto">
        <div class="text-sm mb-1">{example.label}</div>
        <div class="h-[100px] p-4 border rounded-sm">
          <Chart xDomain={example.domain} padding={{ top: 20, bottom: 20, left: 20, right: 20 }}>
            <Layer>
              <Axis
                placement="bottom"
                rule
                grid
                {tickSpacing}
                ticks={{ interval: example.interval }}
              />
            </Layer>
          </Chart>
        </div>
      </div>
    {/each}
  </div>
</Preview>

<h2>Time scale (explicit intervals) with multiline ticks</h2>

<Preview>
  <div class="grid gap-3">
    {#each timeScaleExamples as example}
      <div class="resize-x overflow-auto">
        <div class="text-sm mb-1">{example.label}</div>
        <div class="h-[100px] p-4 border rounded-sm">
          <Chart xDomain={example.domain} padding={{ top: 20, bottom: 20, left: 20, right: 20 }}>
            <Layer>
              <Axis
                placement="bottom"
                rule
                grid
                tickMultiline
                {tickSpacing}
                ticks={{ interval: example.interval }}
              />
            </Layer>
          </Chart>
        </div>
      </div>
    {/each}
  </div>
</Preview>

<div class="flex gap-2 mb-1/2">
  <h2 class="grow">Time scale (brush)</h2>
  <RangeField
    label="tickSpacing"
    labelPlacement="left"
    bind:value={tickSpacing}
    min={10}
    max={300}
    step={10}
  />
</div>

<Preview>
  <div class="p-4 border rounded-sm resize-x overflow-auto">
    <div class="h-[200px]">
      <Chart
        {xDomain}
        yDomain={[0, 100]}
        padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
        brush={{
          resetOnEnd: true,
          onBrushEnd: (e) => {
            xDomain = asAny(e.xDomain);
          },
        }}
      >
        <Layer>
          <Axis placement="bottom" rule grid {tickSpacing} />
          <Axis placement="left" />
        </Layer>
      </Chart>
    </div>

    <div class="h-[80px]">
      <Chart
        xDomain={initialXDomain}
        padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
        brush={{
          mode: 'separated',
          xDomain,
          onChange: (e) => {
            xDomain = asAny(e.xDomain);
          },
        }}
      >
        <Layer>
          <Axis placement="bottom" rule grid ticks={{ interval: timeYear.every(1) }} />
        </Layer>
      </Chart>
    </div>
  </div>
</Preview>

<div class="flex gap-2 mb-1/2">
  <h2 class="grow">Time scale (brush) with multiline ticks</h2>
  <RangeField
    label="tickSpacing"
    labelPlacement="left"
    bind:value={tickSpacing}
    min={10}
    max={300}
    step={10}
  />
</div>

<Preview>
  <div class="p-4 border rounded-sm resize-x overflow-auto">
    <div class="h-[200px]">
      <Chart
        {xDomain}
        yDomain={[0, 100]}
        padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
        brush={{
          resetOnEnd: true,
          onBrushEnd: (e) => {
            xDomain = asAny(e.xDomain);
          },
        }}
      >
        <Layer>
          <Axis placement="bottom" rule grid tickMultiline {tickSpacing} />
          <Axis placement="left" />
        </Layer>
      </Chart>
    </div>

    <div class="h-[80px]">
      <Chart
        xDomain={initialXDomain}
        padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
        brush={{
          mode: 'separated',
          xDomain,
          onChange: (e) => {
            xDomain = asAny(e.xDomain);
          },
        }}
      >
        <Layer>
          <Axis placement="bottom" rule grid ticks={{ interval: timeYear.every(1) }} />
        </Layer>
      </Chart>
    </div>
  </div>
</Preview>
