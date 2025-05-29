<script lang="ts">
  import { scaleTime } from 'd3-scale';
  import { addMinutes, startOfDay } from 'date-fns';
  import { Duration } from 'svelte-ux';

  import { BarChart, Points, Tooltip } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import { getRandomInteger } from '$lib/utils/genData.js';

  const count = 10;
  const now = startOfDay(new Date());
  let lastStartDate = now;

  const data = Array.from({ length: count }).map((_, i) => {
    const startDate = addMinutes(lastStartDate, getRandomInteger(0, 60));
    const endDate = addMinutes(startDate, getRandomInteger(0, 60));
    lastStartDate = startDate;
    return {
      name: `Item ${i + 1}`,
      startDate,
      endDate,
    };
  });

  // TODO: Update to use better data example: https://observablehq.com/@d3/dot-plot
</script>

<h1>Examples</h1>

<h2>Bars</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      {data}
      x={['startDate', 'endDate']}
      xScale={scaleTime()}
      y="name"
      grid={{ x: false, y: true, bandAlign: 'between' }}
      orientation="horizontal"
      padding={{ left: 36, bottom: 36 }}
    >
      {#snippet tooltip({ context })}
        <Tooltip.Root {context}>
          {#snippet children({ data })}
            <Tooltip.Header>{data.name}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item
                label="start"
                value={data.startDate}
                format={{ type: 'time', options: { variant: 'short' } }}
              />
              <Tooltip.Item
                label="end"
                value={data.endDate}
                format={{ type: 'time', options: { variant: 'short' } }}
              />
              <Tooltip.Separator />
              <Tooltip.Item label="duration" valueAlign="right">
                <Duration start={data.startDate} end={data.endDate} totalUnits={2} />
              </Tooltip.Item>
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </BarChart>
  </div>
</Preview>

<h2>Bars - color</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      {data}
      x={['startDate', 'endDate']}
      xScale={scaleTime()}
      y="name"
      c="name"
      cRange={[
        'var(--color-danger)',
        'var(--color-warning)',
        'var(--color-success)',
        'var(--color-info)',
      ]}
      grid={{ x: false, y: true, bandAlign: 'between' }}
      orientation="horizontal"
      padding={{ left: 36, bottom: 36 }}
    >
      {#snippet tooltip({ context })}
        <Tooltip.Root {context}>
          {#snippet children({ data })}
            <Tooltip.Header>{data.name}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item
                label="start"
                value={data.startDate}
                format={{ type: 'time', options: { variant: 'short' } }}
              />
              <Tooltip.Item
                label="end"
                value={data.endDate}
                format={{ type: 'time', options: { variant: 'short' } }}
              />
              <Tooltip.Separator />
              <Tooltip.Item label="duration" valueAlign="right">
                <Duration start={data.startDate} end={data.endDate} totalUnits={2} />
              </Tooltip.Item>
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </BarChart>
  </div>
</Preview>

<h2>Points</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      {data}
      x={['startDate', 'endDate']}
      xScale={scaleTime()}
      y="name"
      grid={{ x: false, y: true, bandAlign: 'between' }}
      orientation="horizontal"
      padding={{ left: 36, bottom: 36 }}
      props={{
        highlight: {
          axis: 'x',
          area: true,
          points: true,
        },
      }}
    >
      {#snippet marks()}
        <Points class="fill-primary-100 stroke-primary" links={{ class: 'stroke-primary' }} />
      {/snippet}

      {#snippet tooltip({ context })}
        <Tooltip.Root {context}>
          {#snippet children({ data })}
            <Tooltip.Header>{data.name}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item
                label="start"
                value={data.startDate}
                format={{ type: 'time', options: { variant: 'short' } }}
              />
              <Tooltip.Item
                label="end"
                value={data.endDate}
                format={{ type: 'time', options: { variant: 'short' } }}
              />
              <Tooltip.Separator />
              <Tooltip.Item label="duration" valueAlign="right">
                <Duration start={data.startDate} end={data.endDate} totalUnits={2} />
              </Tooltip.Item>
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </BarChart>
  </div>
</Preview>

<h2>Points - color</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      {data}
      x={['startDate', 'endDate']}
      xScale={scaleTime()}
      y="name"
      c="name"
      cRange={[
        'var(--color-danger)',
        'var(--color-warning)',
        'var(--color-success)',
        'var(--color-info)',
      ]}
      grid={{ x: false, y: true, bandAlign: 'between' }}
      orientation="horizontal"
      padding={{ left: 36, bottom: 36 }}
      props={{
        highlight: {
          axis: 'x',
          area: true,
          points: true,
        },
      }}
    >
      {#snippet marks()}
        <Points links />
      {/snippet}

      {#snippet tooltip({ context })}
        <Tooltip.Root {context}>
          {#snippet children({ data })}
            <Tooltip.Header>{data.name}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item
                label="start"
                value={data.startDate}
                format={{ type: 'time', options: { variant: 'short' } }}
              />
              <Tooltip.Item
                label="end"
                value={data.endDate}
                format={{ type: 'time', options: { variant: 'short' } }}
              />
              <Tooltip.Separator />
              <Tooltip.Item label="duration" valueAlign="right">
                <Duration start={data.startDate} end={data.endDate} totalUnits={2} />
              </Tooltip.Item>
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </BarChart>
  </div>
</Preview>
