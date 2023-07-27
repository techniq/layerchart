<script lang="ts">
  import { scaleBand, scaleOrdinal, scaleTime } from 'd3-scale';
  import { stack } from 'd3-shape';
  import { format } from 'date-fns';

  import { Duration, formatDate, PeriodType } from 'svelte-ux';
  import { flatten } from 'svelte-ux/utils/array';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Area from '$lib/components/Area.svelte';
  import AreaStack from '$lib/components/AreaStack.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Bars from '$lib/components/Bars.svelte';
  import ConnectedPoints from '$lib/components/ConnectedPoints.svelte';
  import HighlightLine from '$lib/components/HighlightLine.svelte';
  import HighlightRect from '$lib/components/HighlightRect.svelte';
  import Points from '$lib/components/Points.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';
  import TooltipSeparator from '$lib/components/TooltipSeparator.svelte';

  import Preview from '$lib/docs/Preview.svelte';

  import { createDateSeries, createTimeSeries, getSpiral } from '$lib/utils/genData';
  import TooltipControls from './TooltipControls.svelte';
  import type { ComponentProps } from 'svelte';

  const dateSeries = createDateSeries({
    min: 20,
    max: 100,
    value: 'integer',
    keys: ['value', 'baseline'],
  });

  const timeSeries = createTimeSeries({
    min: 20,
    max: 100,
    value: 'integer',
    keys: ['value', 'baseline'],
  });
  const overlapTimeSeries = [
    ...createTimeSeries({ min: 20, max: 100, value: 'integer', keys: ['value', 'baseline'] }),
    ...createTimeSeries({ min: 20, max: 100, value: 'integer', keys: ['value', 'baseline'] }),
  ];

  const keys = ['apples', 'bananas', 'oranges'];
  const stackDateSeries = createDateSeries({ min: 50, max: 100, value: 'integer', keys });
  const stackData = stack().keys(keys)(stackDateSeries);

  const spiralData = getSpiral({ angle: 137.5, radius: 10, count: 100, width: 500, height: 500 });

  let charts = {
    area: {
      mode: 'bisect-x',
      highlight: 'line',
      axis: undefined,
      snapToDataX: false,
      snapToDataY: false,
      debug: false,
    },
    areaStack: {
      mode: 'voronoi',
      highlight: 'line',
      axis: undefined,
      snapToDataX: false,
      snapToDataY: false,
      debug: false,
    },
    dateTime: {
      mode: 'bisect-x',
      highlight: 'line',
      axis: undefined,
      snapToDataX: false,
      snapToDataY: false,
      debug: false,
    },
    duration: {
      mode: 'bounds',
      highlight: 'rect',
      axis: undefined,
      snapToDataX: false,
      snapToDataY: false,
      debug: false,
    },
    multiDuration: {
      mode: 'bounds',
      highlight: 'rect',
      axis: 'both',
      snapToDataX: false,
      snapToDataY: false,
      debug: false,
    },
    bars: {
      mode: 'band',
      highlight: 'rect',
      axis: undefined,
      snapToDataX: false,
      snapToDataY: false,
      debug: false,
    },
    multiBars: {
      mode: 'band',
      highlight: 'rect',
      axis: undefined,
      snapToDataX: false,
      snapToDataY: false,
      debug: false,
    },
    scatter: {
      mode: 'voronoi',
      highlight: 'line',
      axis: 'both',
      snapToDataX: true,
      snapToDataY: true,
      debug: false,
    },
  } satisfies Record<string, ComponentProps<TooltipControls>['settings']>;
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={dateSeries}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
      tooltip
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        <Area class="fill-accent-500/30" line={{ class: 'stroke-accent-500 stroke-2' }} />
        <HighlightLine color="var(--color-accent-500)" />
      </Svg>
      <Tooltip header={(data) => format(data.date, 'eee, MMMM do')} let:data>
        <TooltipItem label="value" value={data.value} />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Style</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={dateSeries}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
      tooltip
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        <Area class="fill-accent-500/30" line={{ class: 'stroke-accent-500 stroke-2' }} />
        <HighlightLine color="var(--color-accent-500)" />
      </Svg>
      <Tooltip class="bg-white text-gray-800 border border-gray-700" let:data>
        <div slot="header" class="font-semibold text-center">
          {format(data.date, 'eee, MMMM do')}
        </div>
        <TooltipItem label="value" value={data.value} classes={{ label: 'text-gray-500' }} />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h1>Chart types</h1>

<h2>Area <small>x: scaleTime, y: scaleLinear</small></h2>
<small class="block -mt-1 mb-1">
  bisect-x recommended. voronoi and quadtree supported. bounds and band to be improved
</small>

<TooltipControls bind:settings={charts.area} />
<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={dateSeries}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
      tooltip={{
        mode: charts.area.mode,
        snapToDataX: charts.area.snapToDataX,
        snapToDataY: charts.area.snapToDataY,
        debug: charts.area.debug,
      }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        <Area class="fill-accent-500/30" line={{ class: 'stroke-accent-500 stroke-2' }} />
        {#if charts.area.highlight === 'line'}
          <HighlightLine
            {...charts.area.axis && { axis: charts.area.axis }}
            color="var(--color-accent-500)"
          />
        {:else if charts.area.highlight === 'rect'}
          <HighlightRect {...charts.area.axis && { axis: charts.area.axis }} />
        {/if}
      </Svg>
      <Tooltip header={(data) => format(data.date, 'eee, MMMM do')} let:data>
        <TooltipItem label="value" value={data.value} />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Stacked Area <small>x: scaleTime, y: scaleLinear (multi/stack)</small></h2>
<small class="block -mt-1 mb-1">
  voronoi and quadtree recommended. bisect-x supported. bounds and band to be improved
</small>

<TooltipControls bind:settings={charts.areaStack} />
<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={stackData}
      flatData={flatten(stackData)}
      x={(d) => d.data.date}
      xScale={scaleTime()}
      y={[0, 1]}
      yNice
      r="key"
      rScale={scaleOrdinal()}
      rDomain={keys}
      rRange={['var(--color-red-500)', 'var(--color-green-500)', 'var(--color-blue-500)']}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{
        mode: charts.areaStack.mode,
        snapToDataX: charts.areaStack.snapToDataX,
        snapToDataY: charts.areaStack.snapToDataY,
        debug: charts.areaStack.debug,
      }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        <AreaStack line={{ class: 'stroke-2' }} />
        {#if charts.areaStack.highlight === 'line'}
          <HighlightLine
            {...charts.areaStack.axis && { axis: charts.areaStack.axis }}
            color="var(--color-blue-500)"
          />
        {:else if charts.areaStack.highlight === 'rect'}
          <HighlightRect {...charts.areaStack.axis && { axis: charts.areaStack.axis }} />
        {/if}
      </Svg>
      <Tooltip header={(data) => format(data.data.date, 'eee, MMMM do')} let:data>
        {#each keys as key}
          <TooltipItem label={key} value={data.data[key]} />
        {/each}
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Single Date / Time <small>x: scaleTime, y: scaleBand</small></h2>
<small class="block -mt-1 mb-1">
  bisect-x recommended. band, voronoi, and quadtree supported
</small>

<TooltipControls bind:settings={charts.dateTime} />
<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={timeSeries}
      x="startDate"
      xScale={scaleTime()}
      y="name"
      yScale={scaleBand()}
      padding={{ left: 36, bottom: 36 }}
      tooltip={{
        mode: charts.dateTime.mode,
        snapToDataX: charts.dateTime.snapToDataX,
        snapToDataY: charts.dateTime.snapToDataY,
        debug: charts.dateTime.debug,
      }}
    >
      <Svg>
        <Axis placement="left" grid={{ style: 'stroke-dasharray: 2' }} rule />
        <Axis placement="bottom" format={(d) => format(d, 'h:mm aa')} />
        <Points class="fill-accent-500 stroke-accent-800" />
        {#if charts.dateTime.highlight === 'line'}
          <HighlightLine
            {...charts.dateTime.axis && { axis: charts.dateTime.axis }}
            color="var(--color-accent-500)"
          />
        {:else if charts.dateTime.highlight === 'rect'}
          <HighlightRect {...charts.dateTime.axis && { axis: charts.dateTime.axis }} />
        {/if}
      </Svg>
      <Tooltip header={(data) => data.name} let:data>
        <TooltipItem label="date" value={format(data.startDate, 'h:mm a')} />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Duration <small>x: scaleTime (multi), y: scaleBand</small></h2>
<small class="block -mt-1 mb-1">
  bisect-band or bounds recommended. band supported (when no overlap on same band). bisect supported
  (when no overlap on time scale). voronoi and quadtree partially supported (using first point)
</small>

<TooltipControls bind:settings={charts.duration} />

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={timeSeries}
      x={['startDate', 'endDate']}
      xScale={scaleTime()}
      y="name"
      yScale={scaleBand()}
      padding={{ left: 36, bottom: 36 }}
      tooltip={{
        mode: charts.duration.mode,
        snapToDataX: charts.duration.snapToDataX,
        snapToDataY: charts.duration.snapToDataY,
        debug: charts.duration.debug,
      }}
    >
      <Svg>
        <Axis placement="left" grid={{ style: 'stroke-dasharray: 2' }} rule />
        <Axis placement="bottom" format={(d) => format(d, 'h:mm aa')} />
        <ConnectedPoints stroke="#000" />
        <Points class="fill-accent-500 stroke-accent-800" />
        {#if charts.duration.highlight === 'line'}
          <HighlightLine
            {...charts.duration.axis && { axis: charts.duration.axis }}
            color="var(--color-accent-500)"
          />
        {:else if charts.duration.highlight === 'rect'}
          <HighlightRect {...charts.duration.axis && { axis: charts.duration.axis }} />
        {/if}
      </Svg>
      <Tooltip header={(data) => data.name} let:data>
        <TooltipItem label="start" value={format(data.startDate, 'h:mm a')} />
        <TooltipItem label="end" value={format(data.endDate, 'h:mm a')} />
        <TooltipSeparator />
        <TooltipItem label="duration" valueAlign="right">
          <Duration start={data.startDate} end={data.endDate} />
        </TooltipItem>
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Multiple (overlapping) Durations <small>x: scaleTime (multi), y: scaleBand</small></h2>
<small class="block -mt-1 mb-1">
  bounds recommended. voronoi and quadtree partially supported (using first point)
</small>

<TooltipControls bind:settings={charts.multiDuration} />

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={overlapTimeSeries}
      x={['startDate', 'endDate']}
      xScale={scaleTime()}
      y="name"
      yScale={scaleBand()}
      padding={{ left: 36, bottom: 36 }}
      tooltip={{
        mode: charts.multiDuration.mode,
        snapToDataX: charts.multiDuration.snapToDataX,
        snapToDataY: charts.multiDuration.snapToDataY,
        debug: charts.multiDuration.debug,
      }}
    >
      <Svg>
        <Axis placement="left" grid={{ style: 'stroke-dasharray: 2' }} rule />
        <Axis placement="bottom" format={(d) => format(d, 'h:mm aa')} />
        <ConnectedPoints stroke="#000" />
        <Points class="fill-accent-500 stroke-accent-800" />
        {#if charts.multiDuration.highlight === 'line'}
          <HighlightLine
            {...charts.multiDuration.axis && { axis: charts.multiDuration.axis }}
            color="var(--color-accent-500)"
          />
        {:else if charts.multiDuration.highlight === 'rect'}
          <HighlightRect {...charts.multiDuration.axis && { axis: charts.multiDuration.axis }} />
        {/if}
      </Svg>
      <Tooltip header={(data) => data.name} let:data>
        <TooltipItem label="start" value={format(data.startDate, 'h:mm a')} />
        <TooltipItem label="end" value={format(data.endDate, 'h:mm a')} />
        <TooltipSeparator />
        <TooltipItem label="duration" valueAlign="right">
          <Duration start={data.startDate} end={data.endDate} />
        </TooltipItem>
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Simple Bars <small>x: scaleBand, y: scaleLinear</small></h2>
<small class="block -mt-1 mb-1">
  band or bounds recommended. bisect-x supported. voronoi and quadtree partially support (using
  value / bar top)
</small>

<TooltipControls bind:settings={charts.bars} />

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={dateSeries}
      x="date"
      xScale={scaleBand().padding(0.4)}
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
      tooltip={{
        mode: charts.bars.mode,
        snapToDataX: charts.bars.snapToDataX,
        snapToDataY: charts.bars.snapToDataY,
        debug: charts.bars.debug,
      }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        <Bars radius={4} strokeWidth={1} class="fill-accent-500" />
        {#if charts.bars.highlight === 'line'}
          <HighlightLine
            {...charts.bars.axis && { axis: charts.bars.axis }}
            color="var(--color-blue-500)"
          />
        {:else if charts.bars.highlight === 'rect'}
          <HighlightRect {...charts.bars.axis && { axis: charts.bars.axis }} />
        {/if}
      </Svg>
      <Tooltip header={(data) => format(data.date, 'eee, MMMM do')} let:data>
        <TooltipItem label="value" value={data.value} />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Multiple (overlapping) Bars <small>x: scaleBand, y: scaleLinear</small></h2>

<small class="block -mt-1 mb-1">
  band or bounds recommended. bisect-x supported. voronoi and quadtree partially support (using
  value / bar top)
</small>

<TooltipControls bind:settings={charts.multiBars} />

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={dateSeries}
      x="date"
      xScale={scaleBand().padding(0.4)}
      y={(d) => Math.max(d.value, d.baseline)}
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
      tooltip={{
        mode: charts.multiBars.mode,
        snapToDataX: charts.multiBars.snapToDataX,
        snapToDataY: charts.multiBars.snapToDataY,
        debug: charts.multiBars.debug,
      }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        <Bars y="baseline" radius={4} strokeWidth={1} class="fill-gray-200" />
        <Bars y="value" radius={4} strokeWidth={1} padding={16} class="fill-accent-500" />
        {#if charts.multiBars.highlight === 'line'}
          <HighlightLine
            {...charts.multiBars.axis && { axis: charts.multiBars.axis }}
            color="var(--color-blue-500)"
          />
        {:else if charts.multiBars.highlight === 'rect'}
          <HighlightRect {...charts.multiBars.axis && { axis: charts.multiBars.axis }} />
        {/if}
      </Svg>
      <Tooltip header={(data) => format(data.date, 'eee, MMMM do')} let:data>
        <TooltipItem label="value" value={data.value} />
        <TooltipItem label="baseline" value={data.baseline} />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Scatter Plot <small>x: scaleLinear, y: scaleLinear</small></h2>

<small class="block -mt-1 mb-1"> voronoi or quadtree recommended </small>

<TooltipControls bind:settings={charts.scatter} />

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={spiralData}
      x="x"
      y="y"
      padding={{ left: 30, bottom: 30 }}
      tooltip={{
        mode: charts.scatter.mode,
        snapToDataX: charts.scatter.snapToDataX,
        snapToDataY: charts.scatter.snapToDataY,
        debug: charts.scatter.debug,
      }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" grid rule />
        <Points class="fill-accent-500 stroke-accent-800" />
        {#if charts.scatter.highlight === 'line'}
          <HighlightLine
            {...charts.scatter.axis && { axis: charts.scatter.axis }}
            color="var(--color-accent-500)"
          />
        {:else if charts.scatter.highlight === 'rect'}
          <HighlightRect {...charts.scatter.axis && { axis: charts.scatter.axis }} />
        {/if}
      </Svg>
      <Tooltip let:data>
        <TooltipItem label="x" value={data.x} format="decimal" />
        <TooltipItem label="y" value={data.y} format="decimal" />
      </Tooltip>
    </Chart>
  </div>
</Preview>
