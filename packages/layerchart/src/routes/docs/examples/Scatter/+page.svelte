<script lang="ts">
  import { scaleTime, scaleThreshold } from 'd3-scale';
  import { format } from 'date-fns';
  import { formatDate, PeriodType } from '@layerstack/utils';

  import { Axis, Chart, Highlight, Labels, Points, Svg, Tooltip } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';

  const data = createDateSeries({ min: 10, max: 100, value: 'integer' });
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
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
        <Points class="fill-primary/10 stroke-primary" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>With Tooltip and Highlight</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
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
        <Points class="fill-primary/10 stroke-primary" />
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

<h2>With Labels</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
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
        <Points class="fill-primary/10 stroke-primary" />
        <Labels format="integer" verticalAnchor="bottom" offset={10} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Color via scale</h2>

<h3>red (0-49), yellow (50-89), green (90+)</h3>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      r="value"
      rScale={scaleThreshold()}
      rDomain={[50, 90]}
      rRange={[
        'hsl(var(--color-danger))',
        'hsl(var(--color-warning))',
        'hsl(var(--color-success))',
      ]}
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Points class="stroke-surface-content/50" />
      </Svg>
    </Chart>
  </div>
</Preview>
