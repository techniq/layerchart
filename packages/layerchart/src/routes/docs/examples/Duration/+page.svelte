<script lang="ts">
  import { scaleTime } from 'd3-scale';
  import { timeMinute, timeDay } from 'd3-time';
  import { Duration } from 'svelte-ux';

  import { BarChart, Points, Tooltip } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import { getRandomInteger } from '$lib/utils/genData.js';
  import { shared } from '../../shared.svelte.js';
  import { applyLanes } from 'layerchart/utils/array.js';

  let { data } = $props();

  const count = 10;
  const now = timeDay.floor(new Date());
  let lastStartDate = now;

  const generatedData = Array.from({ length: count }).map((_, i) => {
    const startDate = timeMinute.offset(lastStartDate, getRandomInteger(0, 60));
    const endDate = timeMinute.offset(startDate, getRandomInteger(0, 60));
    lastStartDate = startDate;
    return {
      name: `Item ${i + 1}`,
      startDate,
      endDate,
    };
  });

  let renderContext = $derived(shared.renderContext as 'svg' | 'canvas');
</script>

<h1>Examples</h1>

<h2>Bars</h2>

<Preview data={generatedData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={generatedData}
      x={['startDate', 'endDate']}
      xScale={scaleTime()}
      y="name"
      grid={{ x: false, y: true, bandAlign: 'between' }}
      orientation="horizontal"
      padding={{ left: 36, bottom: 36 }}
      {renderContext}
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

<h2>Bars (color)</h2>

<Preview data={generatedData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={generatedData}
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
      {renderContext}
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

<h2>Bars (lanes)</h2>

<Preview data={generatedData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={applyLanes(generatedData, { start: 'startDate', end: 'endDate' })}
      x={['startDate', 'endDate']}
      xScale={scaleTime()}
      y="lane"
      c="name"
      cRange={[
        'var(--color-danger)',
        'var(--color-warning)',
        'var(--color-success)',
        'var(--color-info)',
      ]}
      axis="x"
      grid={{ x: true, y: false, bandAlign: 'between' }}
      rule={false}
      orientation="horizontal"
      padding={{ left: 36, bottom: 36 }}
      props={{ tooltip: { context: { mode: 'bounds' } } }}
      {renderContext}
    >
      {#snippet tooltip({ context })}
        <Tooltip.Root {context}>
          {#snippet children({ data })}
            <Tooltip.Header>{data.name}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="start" value={data.startDate} format="day" />
              <Tooltip.Item label="end" value={data.endDate} format="day" />
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

<h2>Bars (dense)</h2>

<Preview data={data.usEvents}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={data.usEvents}
      x={['startDate', 'endDate']}
      xScale={scaleTime()}
      y="event"
      axis="x"
      grid={{ x: true, y: false, bandAlign: 'between' }}
      rule={false}
      orientation="horizontal"
      padding={{ bottom: 36 }}
      {renderContext}
    >
      {#snippet tooltip({ context })}
        <Tooltip.Root {context}>
          {#snippet children({ data })}
            <Tooltip.Header>{data.event}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="start" value={data.startDate} valueAlign="right" format="day" />
              <Tooltip.Item label="end" value={data.endDate} valueAlign="right" format="day" />
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

<h2>Bars (dense lanes)</h2>

<Preview data={data.usEvents}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={applyLanes(data.usEvents, { start: 'startDate', end: 'endDate' })}
      x={['startDate', 'endDate']}
      xScale={scaleTime()}
      y="lane"
      axis="x"
      grid={{ x: true, y: false, bandAlign: 'between' }}
      rule={false}
      orientation="horizontal"
      padding={{ bottom: 36 }}
      props={{ tooltip: { context: { mode: 'bounds' } } }}
      {renderContext}
    >
      {#snippet tooltip({ context })}
        <Tooltip.Root {context}>
          {#snippet children({ data })}
            <Tooltip.Header>{data.event}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="start" value={data.startDate} valueAlign="right" format="day" />
              <Tooltip.Item label="end" value={data.endDate} valueAlign="right" format="day" />
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

<Preview data={generatedData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={generatedData}
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
      {renderContext}
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

<h2>Points (color)</h2>

<Preview data={generatedData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={generatedData}
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
      {renderContext}
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
