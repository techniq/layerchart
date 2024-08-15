<script lang="ts">
  import { cubicInOut } from 'svelte/easing';
  import { scaleBand, scaleOrdinal, scaleTime } from 'd3-scale';
  import { extent, mean } from 'd3-array';
  import { stackOffsetExpand } from 'd3-shape';

  import {
    Axis,
    BarChart,
    Bar,
    Bars,
    Chart,
    Highlight,
    Labels,
    LinearGradient,
    Pattern,
    RectClipPath,
    Rule,
    Svg,
    Text,
    Tooltip,
    createStackData,
    stackOffsetSeparated,
  } from 'layerchart';

  import { Field, ToggleGroup, ToggleOption, Toggle, Switch } from 'svelte-ux';
  import { format, PeriodType } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries, longData } from '$lib/utils/genData.js';

  const data = createDateSeries({
    count: 10,
    min: 20,
    max: 100,
    value: 'integer',
    keys: ['value', 'baseline'],
  });
  const horizontalData = data.slice(0, 10);
  const negativeData = createDateSeries({ count: 30, min: -20, max: 50, value: 'integer' });

  const groupedData = createStackData(longData, { xKey: 'year', groupBy: 'fruit' });
  const stackedData = createStackData(longData, { xKey: 'year', stackBy: 'fruit' });
  const groupedStackedData = createStackData(longData, {
    xKey: 'year',
    groupBy: 'basket',
    stackBy: 'fruit',
  });
  const stackedPercentData = createStackData(longData, {
    xKey: 'year',
    stackBy: 'fruit',
    offset: stackOffsetExpand,
  });
  const stackedSeperatedData = createStackData(longData, {
    xKey: 'year',
    stackBy: 'fruit',
    offset: stackOffsetSeparated,
  });

  const colorKeys = [...new Set(longData.map((x) => x.fruit))];
  const keyColors = [
    'hsl(var(--color-info))',
    'hsl(var(--color-success))',
    'hsl(var(--color-warning))',
    'hsl(var(--color-danger))',
  ];

  let transitionChartMode = 'group';
  $: transitionChart =
    transitionChartMode === 'group'
      ? {
          groupBy: 'fruit',
          stackBy: undefined,
        }
      : transitionChartMode === 'stack'
        ? {
            groupBy: undefined,
            stackBy: 'fruit',
          }
        : transitionChartMode === 'groupStack'
          ? {
              groupBy: 'basket',
              stackBy: 'fruit',
            }
          : {
              groupBy: undefined,
              stackBy: undefined,
            };
  $: transitionData = createStackData(longData, {
    xKey: 'year',
    groupBy: transitionChart.groupBy,
    stackBy: transitionChart.stackBy,
  }) as {
    basket: number;
    fruit: string;
    keys: string[];
    value: number;
    values: number[];
    year: string;
  }[];
</script>

<h1>Examples</h1>

<h2>Vertical (default)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart {data} x="date" y="value" />
  </div>
</Preview>

<h2>Horizontal</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart data={horizontalData} x="value" y="date" layout="horizontal" />
  </div>
</Preview>

<h2>Labels</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart {data} x="date" y="value" labels />
  </div>
</Preview>

<h2>Labels (inside placement)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart {data} x="date" y="value" labels={{ placement: 'inside' }} />
  </div>
</Preview>

<h2>Custom tooltip</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart {data} x="date" y="value">
      <svelte:fragment slot="tooltip" let:x let:y>
        <Tooltip.Root let:data>
          <Tooltip.Header>{format(x(data), PeriodType.DayTime)}</Tooltip.Header>
          <Tooltip.List>
            <Tooltip.Item label="value" value={y(data)} />
          </Tooltip.List>
        </Tooltip.Root>
      </svelte:fragment>
    </BarChart>
  </div>
</Preview>

<h2>Custom chart</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart {data} x="date" y="value" let:x let:y>
      <Svg>
        <Axis
          placement="left"
          grid
          rule
          format={(value) => format(value, undefined, { variant: 'short' })}
        />
        <Axis
          placement="bottom"
          rule
          format={(value) => format(value, undefined, { variant: 'short' })}
        />
        <Bars radius={4} strokeWidth={1} class="fill-primary" />
        <Highlight area />
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{format(x(data))}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={y(data)} />
        </Tooltip.List>
      </Tooltip.Root>
    </BarChart>
  </div>
</Preview>
