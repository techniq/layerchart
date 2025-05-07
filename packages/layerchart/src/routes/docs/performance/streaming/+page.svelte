<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { LineChart } from 'layerchart';
  import { Button, TextField } from 'svelte-ux';
  import { format } from '@layerstack/utils';

  let renderContext: 'svg' | 'canvas' = 'canvas';
  let xPoints = $state(100);
  let maxLength = $state(4000);
  let chartData = $state<{ date: Date; value: number }[]>([]);
  let isStreaming = $state(false);
  let intervalId: any = null;

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

  function startStreaming() {
    if (isStreaming) return;
    isStreaming = true;

    // Get the latest date from the current data or use the last sample date
    const latestDate =
      chartData.length > 0
        ? chartData[chartData.length - 1].date
        : new Date('2025-04-07T22:00:00.000Z');
    let nextDate = new Date(latestDate.getTime() + 24 * 60 * 60 * 1000); // Start from the next day

    intervalId = setInterval(() => {
      const newPoints = generateDataPoints(xPoints, nextDate, 1, [0, 100]);

      // mutate in place
      chartData.splice(0, Math.max(0, chartData.length + newPoints.length - maxLength));
      chartData.push(...newPoints);
      chartData = chartData;

      nextDate = new Date(nextDate.getTime() + xPoints * 24 * 60 * 60 * 1000);
    }, 1000);
  }

  function stopStreaming() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    isStreaming = false;
  }

  function loadRandomData() {
    const latestDate =
      chartData.length > 0
        ? chartData[chartData.length - 1].date
        : new Date('2025-04-07T22:00:00.000Z');
    let nextDate = new Date(latestDate.getTime() + 24 * 60 * 60 * 1000); // Start from the next day
    const newPoints = generateDataPoints(xPoints, nextDate, 1, [0, 100]);

    // mutate in place
    chartData.splice(0, Math.max(0, chartData.length + newPoints.length - maxLength));
    chartData.push(...newPoints);
    chartData = chartData;
  }

  // Clear all data
  function clearData() {
    stopStreaming();
    chartData = [];
  }

  // Start streaming on mount (optional, or triggered by button)
  onMount(() => {
    // Uncomment to start streaming automatically
    // startStreaming();
    return () => stopStreaming(); // Cleanup on component destroy
  });

  // Ensure cleanup on destroy
  onDestroy(() => stopStreaming());
</script>

<div class="m-2 flex items-end gap-2">
  <Button onclick={() => startStreaming()} disabled={isStreaming} variant="outline">Start</Button>
  <Button onclick={() => stopStreaming()} disabled={!isStreaming} variant="outline">Stop</Button>
  <Button onclick={() => clearData()} variant="outline">Clear</Button>
  <Button onclick={() => loadRandomData()} variant="outline">Load random data</Button>

  <TextField label="Frequency (Hz)" bind:value={xPoints} type="integer" min={1} step={100} />
  <TextField label="Buffer size" bind:value={maxLength} type="integer" min={1} step={4000} />
</div>

<div class="h-[500px] p-4 border rounded-sm">
  <LineChart
    x="date"
    data={chartData}
    series={[
      {
        key: 'value',
        // color: '#0f0f0f',
        color: 'var(--color-primary)',
      },
    ]}
    {renderContext}
    brush
  />
</div>

data: {format(chartData.length)} points
