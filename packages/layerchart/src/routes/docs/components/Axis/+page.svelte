<script lang="ts">
  import { scaleTime } from 'd3-scale';
  import { PeriodType, format } from 'svelte-ux';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Preview from '$lib/docs/Preview.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Rule from '$lib/components/Rule.svelte';
  import Text from '$lib/components/Text.svelte';

  import { createDateSeries } from '$lib/utils/genData.js';
  import Blockquote from '$lib/docs/Blockquote.svelte';

  const data = createDateSeries({ min: 50, max: 100, value: 'integer' });
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
          labelProps={{
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
          <svelte:fragment slot="label" let:labelProps let:index>
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
          ticks={(scale) => scale.ticks().filter(Number.isInteger)}
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
          labelProps={{ textAnchor: 'start', dx: 8 }}
          ticks={(scale) => scale.ticks().slice(0, -1)}
          tickLength={22}
        />
        <Axis placement="left" rule />
      </Svg>
    </Chart>
  </div>
</Preview>
