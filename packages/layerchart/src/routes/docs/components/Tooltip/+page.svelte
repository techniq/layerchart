<script lang="ts">
  import { scaleBand, scaleOrdinal, scaleTime } from 'd3-scale';
  import { stack } from 'd3-shape';
  import { format } from 'date-fns';

  import { Button, cls, Duration, Field, formatDate, Menu, PeriodType, Toggle } from 'svelte-ux';
  import { flatten } from 'svelte-ux/utils/array';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Area from '$lib/components/Area.svelte';
  import AreaStack from '$lib/components/AreaStack.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Bars from '$lib/components/Bars.svelte';
  import Highlight from '$lib/components/Highlight.svelte';
  import Points from '$lib/components/Points.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';
  import TooltipSeparator from '$lib/components/TooltipSeparator.svelte';

  import Preview from '$lib/docs/Preview.svelte';

  import { createDateSeries, createTimeSeries, getSpiral } from '$lib/utils/genData';
  import TooltipControls from './TooltipControls.svelte';
  import type { ComponentProps } from 'svelte';

  const dateSeries = createDateSeries({
    count: 30,
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
  const stackDateSeries = createDateSeries({
    count: 30,
    min: 50,
    max: 100,
    value: 'integer',
    keys,
  });
  const stackData = stack().keys(keys)(stackDateSeries);

  const spiralData = getSpiral({ angle: 137.5, radius: 10, count: 100, width: 500, height: 500 });

  let charts = {
    area: {
      mode: 'bisect-x',
      highlight: ['points', 'lines'],
      axis: undefined,
      snapToDataX: false,
      snapToDataY: false,
      debug: false,
    },
    areaStack: {
      mode: 'voronoi',
      highlight: ['points', 'lines'],
      axis: undefined,
      snapToDataX: false,
      snapToDataY: false,
      debug: false,
    },
    dateTime: {
      mode: 'bisect-x',
      highlight: ['points', 'lines'],
      axis: 'x',
      snapToDataX: false,
      snapToDataY: false,
      debug: false,
    },
    duration: {
      mode: 'band',
      highlight: ['area'],
      axis: undefined,
      snapToDataX: false,
      snapToDataY: false,
      debug: false,
    },
    multiDuration: {
      mode: 'bounds',
      highlight: ['area'],
      axis: 'both',
      snapToDataX: false,
      snapToDataY: false,
      debug: false,
    },
    bars: {
      mode: 'band',
      highlight: ['area'],
      axis: undefined,
      snapToDataX: false,
      snapToDataY: false,
      debug: false,
    },
    multiBars: {
      mode: 'band',
      highlight: ['area'],
      axis: undefined,
      snapToDataX: false,
      snapToDataY: false,
      debug: false,
    },
    scatter: {
      mode: 'voronoi',
      highlight: ['points', 'lines'],
      axis: 'both',
      snapToDataX: true,
      snapToDataY: true,
      debug: false,
    },
  } satisfies Record<string, ComponentProps<TooltipControls>['settings']>;

  const anchorOptions = [
    'top-start',
    'top',
    'top-end',
    'left-start',
    'center',
    'right-start',
    'left',
    'right',
    'left-end',
    'right-end',
    'bottom-start',
    'bottom',
    'bottom-end',
  ] as const;
  let anchor: ComponentProps<Tooltip>['anchor'] = 'top-start';
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview data={dateSeries}>
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
        <Highlight points lines />
      </Svg>
      <Tooltip header={(data) => format(data.date, 'eee, MMMM do')} let:data>
        <TooltipItem label="value" value={data.value} />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Light variant</h2>

<Preview data={dateSeries}>
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
        <Highlight points lines />
      </Svg>
      <Tooltip variant="light" let:data>
        <div slot="header" class="font-semibold text-center" let:data>
          {format(data.date, 'eee, MMMM do')}
        </div>
        <TooltipItem label="value" value={data.value} />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Position</h2>
<h3>Default (mouse position with offset)</h3>

<Preview data={dateSeries}>
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
        <Highlight points lines />
      </Svg>
      <Tooltip header={(data) => format(data.date, 'eee, MMMM do')} let:data>
        <TooltipItem label="value" value={data.value} />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h3>Data snapping</h3>

<Preview data={dateSeries}>
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
        <Highlight points lines />
      </Svg>
      <Tooltip top="data" left="data" header={(data) => format(data.date, 'eee, MMMM do')} let:data>
        <TooltipItem label="value" value={data.value} />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h3>Multiple tooltips with fixed single axis</h3>

<Preview data={dateSeries}>
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
      let:height
      let:padding
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        <Area class="fill-accent-500/30" line={{ class: 'stroke-accent-500 stroke-2' }} />
        <Highlight points lines axis="both" />
      </Svg>

      <Tooltip
        top="data"
        left={padding.left}
        anchor="right"
        contained={false}
        variant="none"
        class="text-[10px] font-semibold text-accent-700 bg-accent-50 mt-[2px] px-1 py-[2px] border border-accent-500 rounded whitespace-nowrap"
        let:data
      >
        {data.value}
      </Tooltip>

      <Tooltip
        top={height}
        left="data"
        anchor="top"
        variant="none"
        class="text-[10px] font-semibold text-accent-700 bg-accent-50 mt-[2px] px-2 py-[2px] border border-accent-500 rounded whitespace-nowrap"
        let:data
      >
        {formatDate(data.date, PeriodType.Day)}
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Anchor location</h2>

<div class="mb-2">
  <Toggle let:on={open} let:toggle>
    <Field label="Anchor" class="cursor-pointer" on:click={toggle}>
      <span class="text-sm">
        {anchor}
      </span>
    </Field>
    <Menu {open} on:close={toggle} placement="bottom-start">
      <div class="grid grid-cols-3 grid-rows-5 gap-1 p-1">
        {#each anchorOptions as option}
          <Button
            variant="outline"
            color={option === anchor ? 'blue' : 'default'}
            on:click={() => (anchor = option)}
            class={cls(option === 'center' && 'row-span-3')}
          >
            {option}
          </Button>
        {/each}
      </div>
    </Menu>
  </Toggle>
</div>

<Preview data={dateSeries}>
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
        <Highlight points lines />
      </Svg>
      <Tooltip
        {anchor}
        topOffset={0}
        leftOffset={0}
        header={(data) => format(data.date, 'eee, MMMM do')}
        let:data
      >
        <TooltipItem label="value" value={data.value} />
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
<Preview data={dateSeries}>
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
        debug: charts.area.debug,
      }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        <Area class="fill-accent-500/30" line={{ class: 'stroke-accent-500 stroke-2' }} />
        <Highlight
          points={charts.area.highlight.includes('points')}
          lines={charts.area.highlight.includes('lines')}
          area={charts.area.highlight.includes('area')}
          axis={charts.area.axis}
        />
      </Svg>
      <Tooltip
        top={charts.area.snapToDataY ? 'data' : 'pointer'}
        left={charts.area.snapToDataX ? 'data' : 'pointer'}
        header={(data) => format(data.date, 'eee, MMMM do')}
        let:data
      >
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
<Preview data={dateSeries}>
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
        debug: charts.areaStack.debug,
      }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        <AreaStack line={{ class: 'stroke-2' }} />
        <Highlight
          points={charts.areaStack.highlight.includes('points')}
          lines={charts.areaStack.highlight.includes('lines')}
          area={charts.areaStack.highlight.includes('area')}
          axis={charts.areaStack.axis}
        />
      </Svg>
      <Tooltip
        top={charts.areaStack.snapToDataY ? 'data' : 'pointer'}
        left={charts.areaStack.snapToDataX ? 'data' : 'pointer'}
        header={(data) => format(data.data.date, 'eee, MMMM do')}
        let:data
      >
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
<Preview data={timeSeries}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={timeSeries}
      x="startDate"
      xScale={scaleTime()}
      y="name"
      yScale={scaleBand()}
      yDomain={[...new Set(timeSeries.map((d) => d.name))]}
      padding={{ left: 36, bottom: 36 }}
      tooltip={{
        mode: charts.dateTime.mode,
        debug: charts.dateTime.debug,
      }}
    >
      <Svg>
        <Axis placement="left" grid={{ style: 'stroke-dasharray: 2' }} rule />
        <Axis placement="bottom" format={(d) => format(d, 'h:mm aa')} />
        <Points class="fill-accent-500 stroke-accent-800" />
        <Highlight
          points={charts.dateTime.highlight.includes('points')}
          lines={charts.dateTime.highlight.includes('lines')}
          area={charts.dateTime.highlight.includes('area')}
          axis={charts.dateTime.axis}
        />
      </Svg>
      <Tooltip
        top={charts.dateTime.snapToDataY ? 'data' : 'pointer'}
        left={charts.dateTime.snapToDataX ? 'data' : 'pointer'}
        header={(data) => data.name}
        let:data
      >
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

<Preview data={timeSeries}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={timeSeries}
      x={['startDate', 'endDate']}
      xScale={scaleTime()}
      y="name"
      yScale={scaleBand()}
      yDomain={[...new Set(timeSeries.map((d) => d.name))]}
      padding={{ left: 36, bottom: 36 }}
      tooltip={{
        mode: charts.duration.mode,
        debug: charts.duration.debug,
      }}
    >
      <Svg>
        <Axis placement="left" grid={{ style: 'stroke-dasharray: 2' }} rule />
        <Axis placement="bottom" format={(d) => format(d, 'h:mm aa')} />
        <Points class="fill-accent-500 stroke-accent-800" links />
        <Highlight
          points={charts.duration.highlight.includes('points')}
          lines={charts.duration.highlight.includes('lines')}
          area={charts.duration.highlight.includes('area')}
          axis={charts.duration.axis}
        />
      </Svg>
      <Tooltip
        top={charts.duration.snapToDataY ? 'data' : 'pointer'}
        left={charts.duration.snapToDataX ? 'data' : 'pointer'}
        header={(data) => data.name}
        let:data
      >
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

<Preview data={overlapTimeSeries}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={overlapTimeSeries}
      x={['startDate', 'endDate']}
      xScale={scaleTime()}
      y="name"
      yScale={scaleBand()}
      yDomain={[...new Set(overlapTimeSeries.map((d) => d.name))]}
      padding={{ left: 36, bottom: 36 }}
      tooltip={{
        mode: charts.multiDuration.mode,
        debug: charts.multiDuration.debug,
      }}
    >
      <Svg>
        <Axis placement="left" grid={{ style: 'stroke-dasharray: 2' }} rule />
        <Axis placement="bottom" format={(d) => format(d, 'h:mm aa')} />
        <Points class="fill-accent-500 stroke-accent-800" links />
        <Highlight
          points={charts.multiDuration.highlight.includes('points')}
          lines={charts.multiDuration.highlight.includes('lines')}
          area={charts.multiDuration.highlight.includes('area')}
          axis={charts.multiDuration.axis}
        />
      </Svg>
      <Tooltip
        top={charts.multiDuration.snapToDataY ? 'data' : 'pointer'}
        left={charts.multiDuration.snapToDataX ? 'data' : 'pointer'}
        header={(data) => data.name}
        let:data
      >
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

<Preview data={dateSeries}>
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
        debug: charts.bars.debug,
      }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        <Bars radius={4} strokeWidth={1} class="fill-accent-500" />
        <Highlight
          points={charts.bars.highlight.includes('points')}
          lines={charts.bars.highlight.includes('lines')}
          area={charts.bars.highlight.includes('area')}
          bar={charts.bars.highlight.includes('bar')
            ? { radius: 4, class: 'fill-accent-800' }
            : false}
          axis={charts.bars.axis}
        />
      </Svg>
      <Tooltip
        top={charts.bars.snapToDataY ? 'data' : 'pointer'}
        left={charts.bars.snapToDataX ? 'data' : 'pointer'}
        header={(data) => format(data.date, 'eee, MMMM do')}
        let:data
      >
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

<Preview data={dateSeries}>
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
        debug: charts.multiBars.debug,
      }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        <Bars y="baseline" radius={4} strokeWidth={1} class="fill-gray-200" />
        <Bars y="value" radius={4} strokeWidth={1} inset={8} class="fill-accent-500" />
        <Highlight
          points={charts.multiBars.highlight.includes('points')}
          lines={charts.multiBars.highlight.includes('lines')}
          area={charts.multiBars.highlight.includes('area')}
          bar={charts.multiBars.highlight.includes('bar')
            ? { y: 'baseline', radius: 4, strokeWidth: 1, class: 'fill-gray-400' }
            : false}
          axis={charts.multiBars.axis}
        />
        <Highlight
          bar={charts.multiBars.highlight.includes('bar')
            ? { y: 'value', radius: 4, padding: 16, strokeWidth: 1, class: 'fill-accent-800' }
            : false}
        />
      </Svg>
      <Tooltip
        top={charts.multiBars.snapToDataY ? 'data' : 'pointer'}
        left={charts.multiBars.snapToDataX ? 'data' : 'pointer'}
        header={(data) => format(data.date, 'eee, MMMM do')}
        let:data
      >
        <TooltipItem label="value" value={data.value} />
        <TooltipItem label="baseline" value={data.baseline} />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Scatter Plot <small>x: scaleLinear, y: scaleLinear</small></h2>

<small class="block -mt-1 mb-1"> voronoi or quadtree recommended </small>

<TooltipControls bind:settings={charts.scatter} />

<Preview data={spiralData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={spiralData}
      x="x"
      y="y"
      padding={{ left: 30, bottom: 30 }}
      tooltip={{
        mode: charts.scatter.mode,
        debug: charts.scatter.debug,
      }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" grid rule />
        <Points class="fill-accent-500 stroke-accent-800" />
        <Highlight
          points={charts.scatter.highlight.includes('points')}
          lines={charts.scatter.highlight.includes('lines')}
          area={charts.scatter.highlight.includes('area')}
          axis={charts.scatter.axis}
        />
      </Svg>
      <Tooltip
        top={charts.scatter.snapToDataY ? 'data' : 'pointer'}
        left={charts.scatter.snapToDataX ? 'data' : 'pointer'}
        let:data
      >
        <TooltipItem label="x" value={data.x} format="decimal" />
        <TooltipItem label="y" value={data.y} format="decimal" />
      </Tooltip>
    </Chart>
  </div>
</Preview>
