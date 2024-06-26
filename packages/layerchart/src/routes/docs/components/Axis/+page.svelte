<script lang="ts">
  import { scaleTime } from 'd3-scale';
  import { Field, PeriodType, Switch, format } from 'svelte-ux';

  import { Axis, Chart, Svg, Frame, Rule, Text } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';

  import { createDateSeries } from '$lib/utils/genData.js';
  import Blockquote from '$lib/docs/Blockquote.svelte';

  const data = createDateSeries({ min: 50, max: 100, value: 'integer' });

  let debug = false;
</script>

<h1>Examples</h1>

<h2>left / bottom placement</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>top / right placement</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="top" rule />
        <Axis placement="right" rule />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>rule (left/bottom placement)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>rule (top/right placement)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="top" rule />
        <Axis placement="right" rule />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>grid</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="bottom" grid />
        <Axis placement="left" grid />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>dashed grid lines</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="bottom" />
        <Axis placement="left" grid={{ style: 'stroke-dasharray: 2' }} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>multiple axis grids with single rule</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="left" grid />
        <Axis placement="bottom" grid rule />
      </Svg>
    </Chart>
  </div>
</Preview>

<Blockquote>Axis with rule should be rendered last</Blockquote>

<h2>multiple axis grids and rules</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="left" grid />
        <Axis placement="bottom" grid rule />
        <Rule x="left" />
      </Svg>
    </Chart>
  </div>
</Preview>

<Blockquote>Top-most axis must have separate rule due to SVG rendering order</Blockquote>

<h2>rotated labels and styling</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ top: 20, bottom: 36, left: 20, right: 20 }}
    >
      <Svg>
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
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Remove ticks hashes</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="bottom" rule tickLength={0} />
        <Axis placement="left" rule tickLength={0} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>show only first/last ticks with alignment</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis
          placement="bottom"
          rule
          ticks={(scale) => scale.domain()}
          format={(d) => format(d, PeriodType.Day, { variant: 'long' })}
        >
          <svelte:fragment slot="tickLabel" let:labelProps let:index>
            <Text {...labelProps} textAnchor={index === 0 ? 'start' : 'end'} />
          </svelte:fragment>
        </Axis>
        <Axis placement="left" rule ticks={(scale) => scale.domain()} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>integer-only ticks</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 2]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="bottom" rule />
        <Axis
          placement="left"
          rule
          ticks={(scale) => scale.ticks?.().filter(Number.isInteger)}
          format="integer"
        />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>explicit ticks</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule ticks={[0, 50, 100]} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>tick count</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule ticks={20} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>remove default tick count</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="bottom" rule />
        <Axis placement="left" rule ticks={null} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>label next to hash</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis
          placement="bottom"
          rule={{ class: 'stroke-surface-content/10' }}
          tickLabelProps={{ textAnchor: 'start', dx: 8 }}
          ticks={(scale) => scale.ticks?.().slice(0, -1)}
          tickLength={22}
        />
        <Axis placement="left" rule />
      </Svg>
    </Chart>
  </div>
</Preview>

<div class="grid grid-cols-[1fr,auto] gap-2 items-end">
  <h2>Axis label placements (top/bottom)</h2>

  <div class="mb-2 flex gap-6">
    <Field label="Debug:" dense labelPlacement="left" let:id>
      <Switch {id} bind:checked={debug} />
    </Field>
  </div>
</div>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 32, bottom: 32, left: 20, right: 20 }}
    >
      <Svg>
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
      </Svg>
    </Chart>
  </div>
</Preview>

<div class="grid grid-cols-[1fr,auto] gap-2 items-end">
  <h2>Axis label placements (left/right)</h2>

  <div class="mb-2 flex gap-6">
    <Field label="Debug:" dense labelPlacement="left" let:id>
      <Switch {id} bind:checked={debug} />
    </Field>
  </div>
</div>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 32, right: 32 }}
    >
      <Svg>
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
      </Svg>
    </Chart>
  </div>
</Preview>
