<script lang="ts">
  import { scaleTime } from 'd3-scale';
  import { timeMinute, timeDay } from 'd3-time';
  import { Duration } from 'svelte-ux';

  import { BarChart, Points, Rule, Tooltip } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import { getRandomInteger } from '$lib/utils/genData.js';
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

  function formatYear(number: number): string {
    return Math.sign(number) === -1 ? Math.abs(number) + ' BC' : number + ' AD';
  }
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
    >
      {#snippet marks()}
        <Rule />
        <Points />
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
    >
      {#snippet marks()}
        <Rule />
        <Points />
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

<h2>Civilization timeline</h2>

<Preview data={data.civilizationEvents}>
  <div class="h-[700px] p-4 border rounded-sm">
    <BarChart
      data={data.civilizationEvents}
      x={['start', 'end']}
      y="civilization"
      c="region"
      cRange={[
        'var(--color-danger)',
        'var(--color-warning)',
        'var(--color-success)',
        'var(--color-info)',
      ]}
      rule={false}
      orientation="horizontal"
      padding={{ left: 200, bottom: 36 }}
      props={{
        xAxis: {
          format: formatYear,
        },
        yAxis: {
          tickLabelProps: {
            width: 300,
            truncate: { position: 'middle' },
          },
        },
      }}
    >
      {#snippet tooltip({ context })}
        <Tooltip.Root {context}>
          {#snippet children({ data })}
            <Tooltip.Header>{data.civilization}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="region" value={data.region} />
              <Tooltip.Item label="timeline" value={data.timeline} />
              <!-- <Tooltip.Item label="start label" value={data.startLabel} />
              <Tooltip.Item label="end label" value={data.endLabel} /> -->
              <Tooltip.Item label="start" value={data.start} format={formatYear} />
              <Tooltip.Item label="end" value={data.end} format={formatYear} />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </BarChart>
  </div>
</Preview>

<h2>Civilization timeline (dense)</h2>

<Preview data={applyLanes(data.civilizationEvents)}>
  <div class="h-[500px] p-4 border rounded-sm">
    <BarChart
      data={applyLanes(data.civilizationEvents)}
      x={['start', 'end']}
      y="lane"
      c="region"
      cRange={[
        'var(--color-danger)',
        'var(--color-warning)',
        'var(--color-success)',
        'var(--color-info)',
        'var(--color-primary)',
        'var(--color-secondary)',
        'var(--color-accent)',
      ]}
      rule={false}
      axis="x"
      orientation="horizontal"
      padding={{ left: 20, bottom: 36, right: 20 }}
      props={{
        xAxis: {
          format: formatYear,
        },
        yAxis: {
          tickLabelProps: {
            width: 300,
            truncate: { position: 'middle' },
          },
        },
        tooltip: { context: { mode: 'bounds' } },
      }}
    >
      {#snippet tooltip({ context })}
        <Tooltip.Root {context}>
          {#snippet children({ data })}
            <Tooltip.Header>{data.civilization}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="region" value={data.region} />
              <Tooltip.Item label="timeline" value={data.timeline} />
              <!-- <Tooltip.Item label="start label" value={data.startLabel} />
              <Tooltip.Item label="end label" value={data.endLabel} /> -->
              <Tooltip.Item label="start" value={data.start} format={formatYear} />
              <Tooltip.Item label="end" value={data.end} format={formatYear} />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </BarChart>
  </div>
</Preview>
