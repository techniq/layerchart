<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { scaleBand, scaleOrdinal, scaleTime } from 'd3-scale';
  import { stack } from 'd3-shape';
  import { format } from 'date-fns';

  import { Area, Axis, Bars, Chart, Highlight, Points, Svg, Tooltip } from 'layerchart';
  import { Button, Duration, Field, Menu, MenuField, PeriodType, Toggle } from 'svelte-ux';
  import { formatDate } from '@layerstack/utils';
  import { flatten } from '@layerstack/utils/array';

  import Preview from '$lib/docs/Preview.svelte';
  import TooltipControls from './TooltipControls.svelte';
  import { createDateSeries, createTimeSeries, getSpiral } from '$lib/utils/genData.js';

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
  // TODO: Fix type
  const stackData = stack().keys(keys)(stackDateSeries) as any[];

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
  } as Record<string, ComponentProps<TooltipControls>['settings']>;

  const anchorOptions = [
    'top-left',
    'top',
    'top-right',
    'left',
    'center',
    'right',
    'bottom-left',
    'bottom',
    'bottom-right',
  ] as const;
  let anchor: ComponentProps<Tooltip.Root>['anchor'] = 'top-left';
  let snap: 'pointer' | 'data' = 'pointer';
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
      tooltip={{ mode: 'bisect-x' }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Area class="fill-primary/30" line={{ class: 'stroke-primary stroke-2' }} />
        <Highlight points lines />
      </Svg>
      <Tooltip.Root let:data>
        <Tooltip.Header>{format(data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={data.value} />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Custom content</h2>

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
      tooltip={{ mode: 'bisect-x' }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Area class="fill-primary/30" line={{ class: 'stroke-primary stroke-2' }} />
        <Highlight points lines />
      </Svg>
      <Tooltip.Root let:data>Anything can go here test</Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>color swatch</h2>

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
      tooltip={{ mode: 'bisect-x' }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Area class="fill-primary/30" line={{ class: 'stroke-primary stroke-2' }} />
        <Highlight points lines />
      </Svg>
      <Tooltip.Root let:data>
        <Tooltip.Header>{format(data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={data.value} color="#f00" />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>color swatch using theme</h2>

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
      tooltip={{ mode: 'bisect-x' }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Area class="fill-primary/30" line={{ class: 'stroke-primary stroke-2' }} />
        <Highlight points lines />
      </Svg>
      <Tooltip.Root let:data>
        <Tooltip.Header>{format(data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={data.value} color="hsl(var(--color-primary))" />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>invert variant</h2>

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
      tooltip={{ mode: 'bisect-x' }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Area class="fill-primary/30" line={{ class: 'stroke-primary stroke-2' }} />
        <Highlight points lines />
      </Svg>
      <Tooltip.Root variant="invert" let:data>
        <Tooltip.Header>
          {format(data.date, 'eee, MMMM do')}
        </Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={data.value} />
        </Tooltip.List>
      </Tooltip.Root>
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
      tooltip={{ mode: 'bisect-x' }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Area class="fill-primary/30" line={{ class: 'stroke-primary stroke-2' }} />
        <Highlight points lines />
      </Svg>
      <Tooltip.Root let:data>
        <Tooltip.Header>{format(data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={data.value} />
        </Tooltip.List>
      </Tooltip.Root>
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
      tooltip={{ mode: 'bisect-x' }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Area class="fill-primary/30" line={{ class: 'stroke-primary stroke-2' }} />
        <Highlight points lines />
      </Svg>
      <Tooltip.Root x="data" y="data" let:data>
        <Tooltip.Header>{format(data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={data.value} />
        </Tooltip.List>
      </Tooltip.Root>
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
      tooltip={{ mode: 'bisect-x' }}
      let:height
      let:padding
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Area class="fill-primary/30" line={{ class: 'stroke-primary stroke-2' }} />
        <Highlight points lines axis="both" />
      </Svg>

      <Tooltip.Root
        x={padding.left}
        y="data"
        anchor="right"
        contained={false}
        class="text-[10px] font-semibold text-primary bg-surface-100 mt-[2px] px-1 py-[2px] border border-primary rounded whitespace-nowrap"
        let:data
      >
        {data.value}
      </Tooltip.Root>

      <Tooltip.Root
        x="data"
        y={height}
        anchor="top"
        class="text-[10px] font-semibold text-primary bg-surface-100 mt-[2px] px-2 py-[2px] border border-primary rounded whitespace-nowrap"
        let:data
      >
        {formatDate(data.date, PeriodType.Day)}
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Anchor location</h2>

<div class="grid grid-cols-2 gap-2 mb-2">
  <Toggle let:on={open} let:toggle>
    <Field label="Anchor" class="cursor-pointer" on:click={toggle}>
      <span class="text-sm">
        {anchor}
      </span>
    </Field>

    <MenuField
      label="Snap"
      bind:value={snap}
      options={[
        { label: 'pointer', value: 'pointer' },
        { label: 'data', value: 'data' },
      ]}
    />

    <Menu {open} on:close={toggle} placement="bottom-start">
      <div class="grid grid-cols-3 gap-1 p-1">
        {#each anchorOptions as option}
          <Button
            variant="outline"
            color={option === anchor ? 'primary' : 'default'}
            on:click={() => (anchor = option)}
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
      tooltip={{ mode: 'bisect-x' }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Area class="fill-primary/30" line={{ class: 'stroke-primary stroke-2' }} />
        <Highlight points lines />
      </Svg>
      <Tooltip.Root
        {anchor}
        x={snap}
        xOffset={['top', 'center', 'bottom'].includes(anchor ?? '') ? 0 : 10}
        y={snap}
        yOffset={['left', 'center', 'right'].includes(anchor ?? '') ? 0 : 10}
        let:data
      >
        <Tooltip.Header>{format(data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={data.value} />
        </Tooltip.List>
      </Tooltip.Root>
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
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Area class="fill-primary/30" line={{ class: 'stroke-primary stroke-2' }} />
        <Highlight
          points={charts.area.highlight.includes('points')}
          lines={charts.area.highlight.includes('lines')}
          area={charts.area.highlight.includes('area')}
          axis={charts.area.axis}
        />
      </Svg>
      <Tooltip.Root
        x={charts.area.snapToDataX ? 'data' : 'pointer'}
        y={charts.area.snapToDataY ? 'data' : 'pointer'}
        let:data
      >
        <Tooltip.Header>{format(data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={data.value} />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Stacked Area <small>x: scaleTime, y: scaleLinear (multi/stack)</small></h2>
<small class="block -mt-1 mb-1">
  voronoi and quadtree recommended. bisect-x supported. bounds and band to be improved
</small>

<TooltipControls bind:settings={charts.areaStack} />
<Preview data={stackData}>
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
      rRange={['hsl(var(--color-info))', 'hsl(var(--color-success))', 'hsl(var(--color-warning))']}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{
        mode: charts.areaStack.mode,
        debug: charts.areaStack.debug,
      }}
      let:rGet
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />

        {#each stackData as seriesData}
          {@const color = rGet(seriesData)}
          <Area
            data={seriesData}
            y0={(d) => d[0]}
            y1={(d) => d[1]}
            line={{ stroke: color, 'stroke-width': 2 }}
            fill={color}
            fill-opacity={0.2}
          />
        {/each}

        <Highlight
          points={charts.areaStack.highlight.includes('points')}
          lines={charts.areaStack.highlight.includes('lines')}
          area={charts.areaStack.highlight.includes('area')}
          axis={charts.areaStack.axis}
        />
      </Svg>
      <Tooltip.Root
        x={charts.areaStack.snapToDataX ? 'data' : 'pointer'}
        y={charts.areaStack.snapToDataY ? 'data' : 'pointer'}
        let:data
      >
        <Tooltip.Header>{format(data.data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          {#each keys as key}
            <Tooltip.Item label={key} value={data.data[key]} />
          {/each}
        </Tooltip.List>
      </Tooltip.Root>
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
        <Points class="fill-primary-100 stroke-primary" />
        <Highlight
          points={charts.dateTime.highlight.includes('points')}
          lines={charts.dateTime.highlight.includes('lines')}
          area={charts.dateTime.highlight.includes('area')}
          axis={charts.dateTime.axis}
        />
      </Svg>
      <Tooltip.Root
        x={charts.dateTime.snapToDataX ? 'data' : 'pointer'}
        y={charts.dateTime.snapToDataY ? 'data' : 'pointer'}
        let:data
      >
        <Tooltip.Header>{data.name}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="date" value={format(data.startDate, 'h:mm a')} />
        </Tooltip.List>
      </Tooltip.Root>
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
        <Points class="fill-primary-100 stroke-primary" links />
        <Highlight
          points={charts.duration.highlight.includes('points')}
          lines={charts.duration.highlight.includes('lines')}
          area={charts.duration.highlight.includes('area')}
          axis={charts.duration.axis}
        />
      </Svg>
      <Tooltip.Root
        x={charts.duration.snapToDataX ? 'data' : 'pointer'}
        y={charts.duration.snapToDataY ? 'data' : 'pointer'}
        let:data
      >
        <Tooltip.Header>{data.name}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="start" value={format(data.startDate, 'h:mm a')} />
          <Tooltip.Item label="end" value={format(data.endDate, 'h:mm a')} />
          <Tooltip.Separator />
          <Tooltip.Item label="duration" valueAlign="right">
            <Duration start={data.startDate} end={data.endDate} />
          </Tooltip.Item>
        </Tooltip.List>
      </Tooltip.Root>
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
        <Points class="fill-primary-100 stroke-primary" links />
        <Highlight
          points={charts.multiDuration.highlight.includes('points')}
          lines={charts.multiDuration.highlight.includes('lines')}
          area={charts.multiDuration.highlight.includes('area')}
          axis={charts.multiDuration.axis}
        />
      </Svg>
      <Tooltip.Root
        x={charts.multiDuration.snapToDataX ? 'data' : 'pointer'}
        y={charts.multiDuration.snapToDataY ? 'data' : 'pointer'}
        let:data
      >
        <Tooltip.Header>{data.name}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="start" value={format(data.startDate, 'h:mm a')} />
          <Tooltip.Item label="end" value={format(data.endDate, 'h:mm a')} />
          <Tooltip.Separator />
          <Tooltip.Item label="duration" valueAlign="right">
            <Duration start={data.startDate} end={data.endDate} />
          </Tooltip.Item>
        </Tooltip.List>
      </Tooltip.Root>
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
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Bars radius={4} strokeWidth={1} class="fill-primary" />
        <Highlight
          points={charts.bars.highlight.includes('points')}
          lines={charts.bars.highlight.includes('lines')}
          area={charts.bars.highlight.includes('area')}
          bar={charts.bars.highlight.includes('bar') ? { radius: 4, class: 'fill-primary' } : false}
          axis={charts.bars.axis}
        />
      </Svg>
      <Tooltip.Root
        x={charts.bars.snapToDataX ? 'data' : 'pointer'}
        y={charts.bars.snapToDataY ? 'data' : 'pointer'}
        let:data
      >
        <Tooltip.Header>{format(data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={data.value} />
        </Tooltip.List>
      </Tooltip.Root>
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
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Bars y="baseline" radius={4} strokeWidth={1} class="fill-surface-content/10" />
        <Bars y="value" radius={4} strokeWidth={1} inset={8} class="fill-primary" />
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
            ? { y: 'value', radius: 4, padding: 16, strokeWidth: 1, class: 'fill-primary' }
            : false}
        />
      </Svg>
      <Tooltip.Root
        x={charts.multiBars.snapToDataX ? 'data' : 'pointer'}
        y={charts.multiBars.snapToDataY ? 'data' : 'pointer'}
        let:data
      >
        <Tooltip.Header>{format(data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={data.value} />
          <Tooltip.Item label="baseline" value={data.baseline} />
        </Tooltip.List>
      </Tooltip.Root>
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
        <Points class="fill-primary stroke-primary" />
        <Highlight
          points={charts.scatter.highlight.includes('points')}
          lines={charts.scatter.highlight.includes('lines')}
          area={charts.scatter.highlight.includes('area')}
          axis={charts.scatter.axis}
        />
      </Svg>
      <Tooltip.Root
        x={charts.scatter.snapToDataX ? 'data' : 'pointer'}
        y={charts.scatter.snapToDataY ? 'data' : 'pointer'}
        let:data
      >
        <Tooltip.List>
          <Tooltip.Item label="x" value={data.x} format="decimal" />
          <Tooltip.Item label="y" value={data.y} format="decimal" />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>
