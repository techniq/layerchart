<script lang="ts">
  import { bin } from 'd3-array';
  import { scaleTime } from 'd3-scale';
  import {
    randomBates,
    randomExponential,
    randomInt,
    randomLogNormal,
    randomNormal,
    randomUniform,
  } from 'd3-random';
  import { timeDay, timeMonth, timeWeek } from 'd3-time';

  import { BarChart, Tooltip, thresholdTime } from 'layerchart';
  import { MenuField, RangeField, NumberStepper, State } from 'svelte-ux';
  import { format } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';

  let { data } = $props();

  let thresholds = $state(10);

  const binByWeight = $derived(
    bin<(typeof data.olympians)[0], number>()
      .value((d) => d.weight)
      .thresholds(thresholds)
  );
  const olympiansBins = $derived(binByWeight(data.olympians));

  let selectedGenerator = $state('normal');
  let randomCount = $state(1000);
  let random = $state(randomNormal());
  const randomData = $derived(Array.from({ length: randomCount }, () => random()));
  const binByValues = $derived(bin()); //.domain([0, 1]);
  const randomBins = $derived(binByValues(randomData));

  function getRandomDate(from: Date, to: Date) {
    const fromTime = from.getTime();
    const toTime = to.getTime();
    return new Date(fromTime + random() * (toTime - fromTime));
  }

  const now = new Date();
  let dateRange = $state(10);
  const randomDateData = $derived(
    Array.from({ length: randomCount }, () =>
      getRandomDate(timeDay.offset(now, -dateRange), now)
    ) as any[]
  ); // TODO: Make typescript happy
</script>

<h1>Examples</h1>

<RangeField label="Thresholds" bind:value={thresholds} min={0} max={100} />

<h2>Vertical</h2>

<Preview data={olympiansBins}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={olympiansBins}
      x="x0"
      y="length"
      bandPadding={0.2}
      props={{
        xAxis: { motion: 'tween' },
        yAxis: { format: 'metric', motion: 'tween' },
        bars: { motion: 'tween' },
      }}
    >
      {#snippet tooltip()}
        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header class="text-center">{data.x0 + ' - ' + (data.x1 - 1)}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="count" value={data.length} format="integer" />
              <Tooltip.Separator />
              {#each data.slice(0, 5) as d}
                <Tooltip.Item label={d.name} value={d.weight} />
              {/each}
              {#if data.length > 5}
                <span></span>
                <span>...</span>
              {/if}
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </BarChart>
  </div>
</Preview>

<h2>Horizontal</h2>

<Preview data={olympiansBins}>
  <div class="p-4 border rounded-sm" style:height="{16 + 24 + olympiansBins.length * 20}px">
    <BarChart
      data={olympiansBins}
      x="length"
      y="x0"
      bandPadding={0.2}
      props={{
        xAxis: { motion: 'tween' },
        yAxis: { motion: 'tween' },
        bars: { motion: 'tween' },
      }}
      orientation="horizontal"
    >
      {#snippet tooltip()}
        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header class="text-center">{data.x0 + ' - ' + (data.x1 - 1)}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="count" value={data.length} format="integer" />
              <Tooltip.Separator />
              {#each data.slice(0, 5) as d}
                <Tooltip.Item label={d.name} value={d.weight} />
              {/each}
              {#if data.length > 5}
                <span></span>
                <span>...</span>
              {/if}
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </BarChart>
  </div>
</Preview>

<div class="grid grid-cols-[1fr_148px] gap-2 my-2">
  <MenuField
    label="Generator"
    options={[
      {
        label: 'normal',
        value: 'normal',
      },
      {
        label: 'uniform',
        value: 'uniform',
      },
      {
        label: 'integer',
        value: 'integer',
      },
      {
        label: 'logNormal',
        value: 'logNormal',
      },
      {
        label: 'exponential',
        value: 'exponential',
      },
      {
        label: 'bates',
        value: 'bates',
      },
    ]}
    bind:value={selectedGenerator}
    on:change={(e) => {
      switch (e.detail.value) {
        case 'normal':
          random = randomNormal();
          break;
        case 'uniform':
          random = randomUniform();
          break;
        case 'integer':
          random = randomInt(1, 10);
          break;
        case 'logNormal':
          random = randomLogNormal();
          break;
        case 'exponential':
          random = randomExponential(10);
          break;
        case 'bates':
          random = randomBates(10);
          break;
      }
    }}
  />

  <NumberStepper label="Count" bind:value={randomCount} class="w-full" />
</div>

<h2>Random distribution</h2>

<Preview data={randomBins}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={randomBins}
      x="x0"
      y="length"
      bandPadding={0.2}
      props={{
        xAxis: { motion: 'tween' },
        yAxis: { format: 'metric', motion: 'tween' },
        bars: { motion: 'tween' },
      }}
    >
      {#snippet tooltip()}
        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header class="text-center">{data.x0 + ' - ' + (data.x1 - 0.01)}</Tooltip.Header
            >
            <Tooltip.List>
              <Tooltip.Item label="count" value={data.length} format="integer" />
              <Tooltip.Separator />
              {#each data.slice(0, 5) as d}
                <Tooltip.Item label="value" value={d} />
              {/each}
              {#if data.length > 5}
                <span></span>
                <span>...</span>
              {/if}
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </BarChart>
  </div>
</Preview>

<State initial={{ thresholds: 10 }} let:value let:set>
  {@const binByTime = bin().thresholds(thresholdTime(value?.thresholds ?? 0))}
  {@const data = binByTime(randomDateData)}

  <h2>Date / time (count)</h2>

  <div class="grid grid-cols-[148px_148px] gap-2 mb-2">
    <NumberStepper label="Date range" bind:value={dateRange} class="w-full" />
    <NumberStepper
      label="Thresholds"
      value={value?.thresholds}
      on:change={(e) => set({ thresholds: e.detail.value })}
      class="w-full"
    />
  </div>

  <Preview {data}>
    <div class="h-[300px] p-4 border rounded-sm">
      <BarChart
        {data}
        x="x0"
        y="length"
        bandPadding={0.2}
        props={{
          xAxis: { motion: 'tween' },
          yAxis: { format: 'metric', motion: 'tween' },
          bars: { motion: 'tween' },
        }}
      >
        {#snippet tooltip()}
          <Tooltip.Root>
            {#snippet children({ data })}
              <Tooltip.Header class="text-center">
                {format(data.x0, 'day') + ' - ' + format(data.x1, 'day')}</Tooltip.Header
              >
              <Tooltip.List>
                <Tooltip.Item label="count" value={data.length} format="integer" />
                <Tooltip.Separator />
                {#each data.slice(0, 5) as d}
                  <Tooltip.Item label="value" value={d} format={'daytime'} />
                {/each}
                {#if data.length > 5}
                  <span></span>
                  <span>...</span>
                {/if}
              </Tooltip.List>
            {/snippet}
          </Tooltip.Root>
        {/snippet}
      </BarChart>
    </div>
  </Preview>
</State>

<State initial={{ intervalValue: 'weeks', intervalFunc: timeWeek.range }} let:value let:set>
  {@const binByTime = bin().thresholds(
    (_data, min, max) =>
      value?.intervalFunc(new Date(min), new Date(max)).map((d) => d.valueOf()) ?? []
  )}
  {@const data = binByTime(randomDateData)}

  <h2>Date / time (interval)</h2>

  <div class="grid grid-cols-[148px_148px] gap-2 mb-2">
    <NumberStepper label="Date range" bind:value={dateRange} class="w-full" />
    <MenuField
      label="Interval"
      options={[
        { label: 'Days', value: 'days', interval: timeDay.range },
        { label: 'Weeks', value: 'weeks', interval: timeWeek.range },
        { label: 'Months', value: 'months', interval: timeMonth.range },
      ]}
      value={value?.intervalValue}
      on:change={(e) => {
        set({ intervalValue: e.detail.value, intervalFunc: e.detail.option.interval });
      }}
      stepper
      classes={{ menuIcon: 'hidden' }}
    />
  </div>

  <Preview {data}>
    <div class="h-[300px] p-4 border rounded-sm">
      <BarChart
        {data}
        x="x0"
        y="length"
        bandPadding={0.2}
        padding={{ left: 16, bottom: 48 }}
        props={{
          xAxis: {
            ticks: (scale) => scaleTime(scale.domain(), scale.range()).ticks(),
            tickLabelProps: { rotate: 315, textAnchor: 'end', verticalAnchor: 'middle', dy: 8 },
            motion: 'tween',
          },
          yAxis: { format: 'metric', motion: 'tween' },
          bars: { motion: 'tween' },
        }}
      >
        {#snippet tooltip()}
          <Tooltip.Root>
            {#snippet children({ data })}
              <Tooltip.Header class="text-center">
                {format(data.x0, 'day') + ' - ' + format(data.x1, 'day')}</Tooltip.Header
              >
              <Tooltip.List>
                <Tooltip.Item label="count" value={data.length} format="integer" />
                <Tooltip.Separator />
                {#each data.slice(0, 5) as d}
                  <Tooltip.Item label="value" value={d} format={'daytime'} />
                {/each}
                {#if data.length > 5}
                  <span></span>
                  <span>...</span>
                {/if}
              </Tooltip.List>
            {/snippet}
          </Tooltip.Root>
        {/snippet}
      </BarChart>
    </div>
  </Preview>
</State>
