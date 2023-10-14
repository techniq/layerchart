<script lang="ts">
  import { bin as d3bin } from 'd3-array';
  import { scaleBand } from 'd3-scale';
  import {
    randomBates,
    randomExponential,
    randomInt,
    randomLogNormal,
    randomNormal,
    randomUniform,
  } from 'd3-random';
  import { subDays } from 'date-fns';

  import { MenuField, NumberStepper, PeriodType, dateDisplay, formatDate } from 'svelte-ux';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Bars from '$lib/components/Bars.svelte';
  import Highlight from '$lib/components/Highlight.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';
  import TooltipSeparator from '$lib/components/TooltipSeparator.svelte';

  import RangeField from '$lib/docs/RangeField.svelte';
  import { thresholdTime } from '$lib/utils/threshold';

  import Preview from '$lib/docs/Preview.svelte';

  import olympians from '../_data/olympians.json';

  let thresholds = 10;

  $: binByWeight = d3bin()
    .value((d) => d.weight)
    .thresholds(thresholds);
  $: olympiansBins = binByWeight(olympians);

  let selectedGenerator = 'normal';
  let randomCount = 1000;
  $: random = randomNormal();
  $: randomData = Array.from({ length: randomCount }, () => random());
  $: binByValues = d3bin(); //.domain([0, 1]);
  $: randomBins = binByValues(randomData);

  $: getRandomDate = (from: Date, to: Date) => {
    const fromTime = from.getTime();
    const toTime = to.getTime();
    return new Date(fromTime + random() * (toTime - fromTime));
  };

  const now = new Date();
  let dateRange = 10;
  let dateThresholds = 10;
  $: randomDateData = Array.from({ length: randomCount }, () =>
    getRandomDate(subDays(now, dateRange), now)
  );
  $: binByTime = d3bin().thresholds(thresholdTime(dateThresholds));
  $: timeBins = binByTime(randomDateData);
</script>

<h1>Examples</h1>

<RangeField label="Thresholds" bind:value={thresholds} min={0} max={100} />

<h2>Vertical</h2>

<Preview data={olympiansBins}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={olympiansBins}
      x={['x0', 'x1']}
      xScale={scaleBand().padding(0.2)}
      y="length"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 16 }}
      tooltip={{ mode: 'band' }}
    >
      <Svg>
        <Axis placement="left" grid rule format="metric" />
        <Axis placement="bottom" rule ticks={4} />
        <Bars radius={4} strokeWidth={1} class="fill-accent-500" />
        <Highlight area />
      </Svg>
      <Tooltip header={(data) => data.x0 + ' - ' + (data.x1 - 1)} let:data>
        <TooltipItem label="count" value={data.length} format="integer" />
        <TooltipSeparator />
        {#each data.slice(0, 5) as d}
          <TooltipItem label={d.name} value={d.weight} />
        {/each}
        {#if data.length > 5}
          <span />
          <span>...</span>
        {/if}
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Horizontal</h2>

<Preview data={olympiansBins}>
  <div class="p-4 border rounded" style:height="{16 + 24 + olympiansBins.length * 20}px">
    <Chart
      data={olympiansBins}
      x="length"
      xDomain={[0, null]}
      xNice
      y={['x0', 'x1']}
      yScale={scaleBand().padding(0.2)}
      padding={{ left: 16, bottom: 16 }}
      tooltip={{ mode: 'band' }}
    >
      <Svg>
        <Axis placement="left" rule />
        <Axis placement="bottom" grid rule />
        <Bars radius={4} strokeWidth={1} class="fill-accent-500" />
        <Highlight area />
      </Svg>
      <Tooltip header={(data) => data.x0 + ' - ' + (data.x1 - 1)} let:data>
        <TooltipItem label="count" value={data.length} format="integer" />
        <TooltipSeparator />
        {#each data.slice(0, 5) as d}
          <TooltipItem label={d.name} value={d.weight} />
        {/each}
        {#if data.length > 5}
          <span />
          <span>...</span>
        {/if}
      </Tooltip>
    </Chart>
  </div>
</Preview>

<div class="grid grid-cols-[1fr,148px] gap-2 my-2">
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
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={randomBins}
      x={['x0', 'x1']}
      xScale={scaleBand().padding(0.2)}
      y="length"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 16 }}
      tooltip={{ mode: 'band' }}
    >
      <Svg>
        <Axis placement="left" grid rule format="metric" />
        <Axis placement="bottom" rule ticks={4} />
        <Bars radius={4} strokeWidth={1} tweened getKey={(d) => d.x0} class="fill-accent-500" />
        <Highlight area />
      </Svg>
      <Tooltip header={(data) => data.x0 + ' - ' + (data.x1 - 0.01)} let:data>
        <TooltipItem label="count" value={data.length} format="integer" />
        <TooltipSeparator />
        {#each data.slice(0, 5) as d}
          <TooltipItem label="value" value={d} />
        {/each}
        {#if data.length > 5}
          <span />
          <span>...</span>
        {/if}
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Date / time</h2>

<div class="grid grid-cols-[148px,148px] gap-2 mb-2">
  <NumberStepper label="Date range" bind:value={dateRange} class="w-full" />
  <NumberStepper label="Thresholds" bind:value={dateThresholds} class="w-full" />
</div>

<Preview data={timeBins}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={timeBins}
      x={['x0', 'x1']}
      xScale={scaleBand().padding(0.2)}
      y="length"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 48 }}
      tooltip={{ mode: 'band' }}
    >
      <Svg>
        <Axis placement="left" grid rule format="metric" />
        <Axis
          placement="bottom"
          rule
          ticks={4}
          format={(d) => dateDisplay(d, { format: 'M/d/yy' })}
          labelProps={{ rotate: 315, textAnchor: 'end', verticalAnchor: 'middle', dy: 8 }}
        />
        <Bars radius={4} strokeWidth={1} class="fill-accent-500" />
        <Highlight area />
      </Svg>
      <Tooltip
        header={(data) =>
          dateDisplay(data.x0, { format: 'M/d/yy' }) +
          ' - ' +
          dateDisplay(data.x1, { format: 'M/d/yy' })}
        let:data
      >
        <TooltipItem label="count" value={data.length} format="integer" />
        <TooltipSeparator />
        {#each data.slice(0, 5) as d}
          <TooltipItem label="value" value={d} format={(value) => dateDisplay(value)} />
        {/each}
        {#if data.length > 5}
          <span />
          <span>...</span>
        {/if}
      </Tooltip>
    </Chart>
  </div>
</Preview>
