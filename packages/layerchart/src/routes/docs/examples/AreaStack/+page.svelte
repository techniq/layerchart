<script lang="ts">
  import { scaleOrdinal, scaleTime } from 'd3-scale';
  import { stack } from 'd3-shape';
  import { format } from 'date-fns';
  import { formatDate, PeriodType } from '@layerstack/utils';
  import { flatten } from '@layerstack/utils/array';

  import {
    Area,
    AreaStack,
    Axis,
    Chart,
    Highlight,
    Labels,
    LinearGradient,
    Svg,
    Tooltip,
    chartDataArray,
  } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';

  const keys = ['apples', 'bananas', 'oranges'];
  const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer', keys });
  const stackData = stack().keys(keys)(data) as any[];
</script>

<h1>Examples</h1>

<h2>Basic</h2>

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
      rRange={['hsl(var(--color-danger))', 'hsl(var(--color-success))', 'hsl(var(--color-info))']}
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <AreaStack line={{ 'stroke-width': 2 }} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>With Tooltip and Highlight</h2>

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
      rRange={['hsl(var(--color-danger))', 'hsl(var(--color-success))', 'hsl(var(--color-info))']}
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
        <AreaStack line={{ 'stroke-width': 2 }} />
        <Highlight points lines />
      </Svg>
      <Tooltip.Root let:data>
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

<!-- TODO: Current shows the stacked value, but should it show the individual series value instead? -->
<!-- <h2>With Labels</h2>

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
      rRange={['hsl(var(--color-danger))', 'hsl(var(--color-success))', 'hsl(var(--color-info))']}
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <AreaStack line={{ 'stroke-width': 2 }} />
        <Labels />
      </Svg>
    </Chart>
  </div>
</Preview> -->

<h2>Slot with gradient</h2>

<Preview data={stackData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={stackData}
      flatData={flatten(stackData)}
      x={(d) => d.data.date}
      xScale={scaleTime()}
      y={[0, 1]}
      yNice
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <AreaStack let:data>
          {@const primaryColorScale = scaleOrdinal([
            'hsl(var(--color-danger-500))',
            'hsl(var(--color-success-500))',
            'hsl(var(--color-info-500))',
          ])}
          {@const secondaryColorScale = scaleOrdinal([
            'hsl(var(--color-danger-500) / 10%)',
            'hsl(var(--color-success-500) / 10%)',
            'hsl(var(--color-info-500) / 10%)',
          ])}

          {#each chartDataArray(data) as seriesData, index}
            {@const primaryColor = primaryColorScale(String(index))}
            {@const secondaryColor = secondaryColorScale(String(index))}

            <LinearGradient stops={[primaryColor, secondaryColor]} vertical let:url>
              <Area
                data={seriesData}
                y0={(d) => d[0]}
                y1={(d) => d[1]}
                fill={url}
                fill-opacity={0.5}
                line={{ stroke: primaryColor }}
              />
            </LinearGradient>
          {/each}
        </AreaStack>
      </Svg>
    </Chart>
  </div>
</Preview>
