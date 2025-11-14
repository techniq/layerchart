<script lang="ts">
  import { LineChart } from 'layerchart';
  import { Button, ButtonGroup, Field, TextField, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { format } from '@layerstack/utils';
  import { TimerState } from '@layerstack/svelte-state';
  import { shared } from '../../shared.svelte.js';

  let renderContext = $derived(shared.renderContext as 'svg' | 'canvas');
  let motion = $state(true);
  let show = $state(true);

  let points = $state(100);
  let maxLength = $state(4000);
  let chartData = $state<{ date: Date; value: number }[]>([]);
  // let chartData = $state.raw<{ date: Date; value: number }[]>([]);

  function generateDataPoint(
    referenceDate: Date,
    valueRange: [number, number]
  ): { date: Date; value: number } {
    const value = Math.floor(Math.random() * (valueRange[1] - valueRange[0] + 1)) + valueRange[0];
    return {
      date: new Date(referenceDate),
      value: isFinite(value) ? value : valueRange[0],
    };
  }

  function generateDataPoints(
    count: number,
    startDate: Date,
    dayIncrement: number,
    valueRange: [number, number]
  ): { date: Date; value: number }[] {
    const points: { date: Date; value: number }[] = [];
    for (let i = 0; i < count; i++) {
      const date = new Date(startDate.getTime() + i * dayIncrement * 24 * 60 * 60 * 1000);
      if (isNaN(date.getTime())) continue;
      points.push(generateDataPoint(date, valueRange));
    }
    return points;
  }

  const timer = new TimerState({
    tick: () => {
      // Get the latest date from the current data or use the last sample date
      const latestDate =
        chartData.length > 0
          ? chartData[chartData.length - 1].date
          : new Date('2025-04-07T22:00:00.000Z');
      let nextDate = new Date(latestDate.getTime() + 24 * 60 * 60 * 1000); // Start from the next day

      const newPoints = generateDataPoints(points, nextDate, 1, [0, 100]);

      // mutate in place
      chartData.splice(0, Math.max(0, chartData.length + newPoints.length - maxLength));
      chartData.push(...newPoints);

      // chartData = [
      //   ...chartData.slice(Math.max(0, chartData.length + newPoints.length - maxLength)),
      //   ...newPoints,
      // ];

      nextDate = new Date(nextDate.getTime() + points * 24 * 60 * 60 * 1000);
    },
    // svelte-ignore state_referenced_locally
    delay: points,
    disabled: true,
  });

  $effect(() => {
    timer.delay = points;
  });

  function loadRandomData() {
    const latestDate =
      chartData.length > 0
        ? chartData[chartData.length - 1].date
        : new Date('2025-04-07T22:00:00.000Z');
    let nextDate = new Date(latestDate.getTime() + 24 * 60 * 60 * 1000); // Start from the next day
    const newPoints = generateDataPoints(points, nextDate, 1, [0, 100]);

    // mutate in place
    chartData.splice(0, Math.max(0, chartData.length + newPoints.length - maxLength));
    chartData.push(...newPoints);
    chartData = chartData;
  }

  // Clear all data
  function clearData() {
    timer.stop();
    chartData = [];
  }
</script>

<div class="grid gap-4">
  <div class="flex gap-3">
    <Field label="Motion">
      <ToggleGroup bind:value={motion} variant="outline">
        <ToggleOption value={true}>Yes</ToggleOption>
        <ToggleOption value={false}>No</ToggleOption>
      </ToggleGroup>
    </Field>

    <Field label="Show">
      <ToggleGroup bind:value={show} variant="outline">
        <ToggleOption value={true}>Yes</ToggleOption>
        <ToggleOption value={false}>No</ToggleOption>
      </ToggleGroup>
    </Field>
  </div>

  <div class="m-2 flex items-end gap-2">
    <ButtonGroup _size="sm" variant="fill-light">
      <Button onclick={() => timer.start()} disabled={timer.running}>Start</Button>
      <Button onclick={() => timer.stop()} disabled={!timer.running}>Stop</Button>
    </ButtonGroup>
    <Button onclick={() => clearData()} variant="fill-light">Clear</Button>
    <Button onclick={() => loadRandomData()} variant="fill-light">Load more</Button>

    <TextField label="Frequency (Hz)" bind:value={points} type="integer" min={1} step={100} dense />
    <TextField
      label="Buffer size"
      bind:value={maxLength}
      type="integer"
      min={1}
      step={4000}
      dense
    />
  </div>

  <div class="h-[500px] p-4 border rounded-sm">
    {#if show && chartData.length}
      <LineChart x="date" y="value" data={chartData} {renderContext} brush />
    {/if}
  </div>

  data: {format(chartData.length)} points
</div>
