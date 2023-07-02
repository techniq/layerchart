<script lang="ts">
  import { cubicInOut } from 'svelte/easing';
  import { scaleBand, scaleOrdinal } from 'd3-scale';
  import { format } from 'date-fns';
  import { extent, median } from 'd3-array';
  import { stackOffsetExpand } from 'd3-shape';

  import { Field, ToggleGroup, ToggleOption, formatDate, PeriodType } from 'svelte-ux';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Rule from '$lib/components/Rule.svelte';
  import Bars from '$lib/components/Bars.svelte';
  import HighlightRect from '$lib/components/HighlightRect.svelte';
  import Labels from '$lib/components/Labels.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  import Preview from '$lib/docs/Preview.svelte';
  import { createStackData, stackOffsetSeparated } from '$lib/utils/stack';
  import { createDateSeries, longData } from '$lib/utils/genData';

  const data = createDateSeries({
    min: 20,
    max: 100,
    value: 'integer',
    keys: ['value', 'baseline']
  });
  const negativeData = createDateSeries({ min: -20, max: 50, value: 'integer' });

  const groupedData = createStackData(longData, { xKey: 'year', groupBy: 'fruit' });
  const stackedData = createStackData(longData, { xKey: 'year', stackBy: 'fruit' });
  const groupedStackedData = createStackData(longData, {
    xKey: 'year',
    groupBy: 'basket',
    stackBy: 'fruit'
  });
  const stackedPercentData = createStackData(longData, {
    xKey: 'year',
    stackBy: 'fruit',
    offset: stackOffsetExpand
  });
  const stackedSeperatedData = createStackData(longData, {
    xKey: 'year',
    stackBy: 'fruit',
    offset: stackOffsetSeparated
  });

  const colorKeys = [...new Set(longData.map((x) => x.fruit))];
  const keyColors = [
    'var(--color-blue-500)',
    'var(--color-green-500)',
    'var(--color-purple-500)',
    'var(--color-orange-500)'
  ];

  let transitionChartMode = 'group';
  $: transitionChart =
    transitionChartMode === 'group'
      ? {
          groupBy: 'fruit',
          stackBy: undefined
        }
      : transitionChartMode === 'stack'
      ? {
          groupBy: undefined,
          stackBy: 'fruit'
        }
      : transitionChartMode === 'groupStack'
      ? {
          groupBy: 'basket',
          stackBy: 'fruit'
        }
      : {
          groupBy: undefined,
          stackBy: undefined
        };
  $: transitionData = createStackData(longData, {
    xKey: 'year',
    groupBy: transitionChart.groupBy,
    stackBy: transitionChart.stackBy
  });
  // $: console.log({ transitionData })
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="value"
      xDomain={[0, null]}
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 20, bottom: 20 }}
    >
      <Svg>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        <Bars radius={4} strokeWidth={1} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>with Tooltip and HighlightRect</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="value"
      xDomain={[0, null]}
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'band' }}
    >
      <Svg>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        <Bars radius={4} strokeWidth={1} />
        <HighlightRect />
      </Svg>
      <Tooltip header={(data) => format(data.date, 'eee, MMMM do')} let:data>
        <TooltipItem label="value" value={data.value} />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>with Labels and negative data</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={negativeData}
      x="value"
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        <Rule x={0} />
        <Bars radius={4} strokeWidth={1} />
        <Labels format="integer" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Average annotation Rule</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="value"
      xDomain={[0, null]}
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 20, bottom: 20 }}
    >
      <Svg>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        <Bars radius={4} strokeWidth={1} />
        <Rule x={median(data, (d) => d.value)} class="stroke-red-400 [stroke-dasharray:2]" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>with grid on top</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="value"
      xDomain={[0, null]}
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Bars radius={4} strokeWidth={1} />
        <Axis placement="bottom" grid={{ class: 'stroke-white' }} rule />
        <Axis placement="left" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>with grid on top (mix-blend)</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="value"
      xDomain={[0, null]}
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Bars radius={4} strokeWidth={1} />
        <Axis placement="bottom" grid={{ class: 'mix-blend-multiply' }} rule />
        <Axis placement="left" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Multiple (overlapping)</h2>

<Preview>
  <div class="h-[500px] p-4 border rounded">
    <Chart
      {data}
      x={(d) => Math.max(d.value, d.baseline)}
      xDomain={[0, null]}
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'band' }}
    >
      <Svg>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        <Bars x="baseline" radius={4} strokeWidth={1} color="#ddd" />
        <Bars x="value" radius={4} strokeWidth={1} padding={16} />
        <HighlightRect />
      </Svg>
      <Tooltip header={(data) => format(data.date, 'eee, MMMM do')} let:data>
        <TooltipItem label="value" value={data.value} />
        <TooltipItem label="baseline" value={data.baseline} />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Grouped</h2>

<Preview>
  <div class="h-[400px] p-4 border rounded">
    <Chart
      data={groupedData}
      flatData={longData}
      extents={{
        x: extent(groupedData.flatMap((d) => d.values))
      }}
      x="values"
      xNice
      y="year"
      yScale={scaleBand().paddingInner(0.3).paddingOuter(0.1)}
      r={(d) => d}
      rScale={scaleOrdinal()}
      rDomain={colorKeys}
      rRange={keyColors}
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" rule />
        <Bars groupBy="fruit" getKey={(item) => item.keys.join('-')} radius={4} strokeWidth={1} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Stacked</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={stackedData}
      extents={{
        x: extent(stackedData.flatMap((d) => d.values))
      }}
      y="year"
      yScale={scaleBand().paddingInner(0.4).paddingOuter(0.1)}
      x="values"
      xNice
      r={(d) => d.keys[1]}
      rScale={scaleOrdinal()}
      rDomain={colorKeys}
      rRange={keyColors}
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" rule />
        <Bars getKey={(item) => item.keys.join('-')} radius={4} strokeWidth={1} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Stacked (Percent)</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={stackedPercentData}
      extents={{
        x: extent(stackedPercentData.flatMap((d) => d.values))
      }}
      x="values"
      xNice
      y="year"
      yScale={scaleBand().paddingInner(0.4).paddingOuter(0.1)}
      r={(d) => d.keys[1]}
      rScale={scaleOrdinal()}
      rDomain={colorKeys}
      rRange={keyColors}
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="bottom" grid rule format="percentRound" />
        <Axis placement="left" rule />
        <Bars getKey={(item) => item.keys.join('-')} radius={4} strokeWidth={1} />
      </Svg>
    </Chart>
  </div>
</Preview>

<!-- <h2>Stack (Separated)</h2>

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={stackedSeperatedData}
			extents={{
				x: extent(stackedSeperatedData.flatMap((d) => d.values))
			}}
			x="values"
			xNice
			y="year"
			yScale={scaleBand().paddingInner(0.4).paddingOuter(0.1)}
			r={(d) => d.keys[1]}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
        <Axis placement="bottom" grid rule />
				<Axis placement="left" rule />
				<Bars getKey={(item) => item.keys.join('-')} radius={4} strokeWidth={1} />
			</Svg>
		</Chart>
	</div>
</Preview> -->

<h2>Grouped and Stacked</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={groupedStackedData}
      flatData={longData}
      extents={{
        x: extent(groupedStackedData.flatMap((d) => d.values))
      }}
      x="values"
      xNice
      y="year"
      yScale={scaleBand().paddingInner(0.4).paddingOuter(0.1)}
      r={(d) => d}
      rScale={scaleOrdinal()}
      rDomain={colorKeys}
      rRange={keyColors}
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" rule />
        <Bars groupBy="basket" getKey={(item) => item.keys.join('-')} radius={4} strokeWidth={1} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Grouped, Stacked, or Both (transition)</h2>

<div class="grid grid-cols-[1fr,1fr] gap-2 mb-2">
  <Field label="Mode">
    <ToggleGroup
      bind:value={transitionChartMode}
      variant="contained"
      classes={{ root: 'w-full', options: 'w-full' }}
    >
      <ToggleOption value="group">Grouped</ToggleOption>
      <ToggleOption value="stack">Stacked</ToggleOption>
      <ToggleOption value="groupStack">Grouped & Stacked</ToggleOption>
    </ToggleGroup>
  </Field>
</div>

<Preview>
  <div class="h-[400px] p-4 border rounded">
    <!-- Always use stackedData for extents for consistent scale -->
    <Chart
      data={transitionData}
      extents={{
        x: extent(stackedData.flatMap((d) => d.values))
      }}
      x="values"
      xNice
      y="year"
      yScale={scaleBand().paddingInner(0.2).paddingOuter(0.1)}
      r={(d) => {
        // Color by fruit (last key)
        return d.keys.at(-1);
      }}
      rScale={scaleOrdinal()}
      rDomain={colorKeys}
      rRange={keyColors}
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" rule />
        <Bars
          groupBy={transitionChart.groupBy}
          getKey={(item) => item.keys.at(0) + '-' + item.keys.at(-1)}
          radius={4}
          strokeWidth={1}
          tweened={{
            x: { easing: cubicInOut, delay: transitionChart.groupBy ? 0 : 300 },
            y: { easing: cubicInOut, delay: transitionChart.groupBy ? 300 : 0 },
            width: { easing: cubicInOut, delay: transitionChart.groupBy ? 0 : 300 },
            height: { easing: cubicInOut, delay: transitionChart.groupBy ? 300 : 0 }
          }}
        />
      </Svg>
    </Chart>
  </div>
</Preview>
