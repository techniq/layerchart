<script lang="ts">
  import { range } from 'd3-array';
  import { randomNormal } from 'd3-random';

  import {
    scaleSequential,
    scaleSequentialSqrt,
    scaleDiverging,
    scaleDivergingSqrt,
    scaleSequentialLog,
    scaleSequentialQuantile,
    scaleSqrt,
    scaleQuantize,
    scaleQuantile,
    scaleThreshold,
    scaleOrdinal,
  } from 'd3-scale';

  import {
    interpolateViridis,
    interpolateTurbo,
    interpolatePiYG,
    interpolateRdBu,
    interpolateBlues,
    schemePurples,
    schemeSpectral,
    schemeRdBu,
  } from 'd3-scale-chromatic';

  import { Chart, Legend } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';

  const randomExponentialData = range(100).map(() => Math.random() ** 2);
  const randomNormalData = range(1000).map(randomNormal(100, 20));
</script>

<h1>Examples</h1>

<h2>scaleSequential</h2>

<Preview>
  <div class="grid gap-6">
    <Legend scale={scaleSequential([0, 100], interpolateViridis)} title="Temperature (°F)" />

    <Legend
      scale={scaleSequential([0, 100], interpolateViridis)}
      title="Temperature (°F)"
      variant="swatches"
    />
  </div>
</Preview>

<h2>scaleSequentialSqrt</h2>

<Preview>
  <div class="grid gap-6">
    <Legend scale={scaleSequentialSqrt([0, 1], interpolateTurbo)} title="Speed (kts)" />
    <Legend
      scale={scaleSequentialSqrt([0, 1], interpolateTurbo)}
      title="Speed (kts)"
      variant="swatches"
    />
  </div>
</Preview>

<h2>scaleDiverging</h2>

<Preview>
  <div class="grid gap-6">
    <Legend
      scale={scaleDiverging([-0.1, 0, 0.1], interpolatePiYG)}
      title="Daily change"
      tickFormat="percentRound"
    />
    <Legend
      scale={scaleDiverging([-0.1, 0, 0.1], interpolatePiYG)}
      title="Daily change"
      tickFormat="percentRound"
      variant="swatches"
    />
  </div>
</Preview>

<h2>scaleDivergingSqrt</h2>

<Preview>
  <div class="grid gap-6">
    <Legend
      scale={scaleDivergingSqrt([-0.1, 0, 0.1], interpolateRdBu)}
      title="Daily change"
      tickFormat="percentRound"
    />
    <Legend
      scale={scaleDivergingSqrt([-0.1, 0, 0.1], interpolateRdBu)}
      title="Daily change"
      tickFormat="percentRound"
      variant="swatches"
    />
  </div>
</Preview>

<h2>scaleSequentialLog</h2>

<Preview>
  <div class="grid gap-6">
    <Legend
      scale={scaleSequentialLog([1, 100], interpolateBlues)}
      title="Energy (joules)"
      ticks={10}
    />
    <!-- TODO: Update Legend to hide swatches/ticks without labels -->
    <!-- <Legend
      scale={scaleSequentialLog([1, 100], interpolateBlues)}
      title="Energy (joules)"
      ticks={10}
      variant="swatches"
    /> -->
  </div>
</Preview>

<h2>scaleSequentialQuantile</h2>

<Preview>
  <div class="grid gap-6">
    <Legend
      scale={scaleSequentialQuantile(randomExponentialData, interpolateBlues)}
      title="Quantile"
      tickFormat="decimal"
    />
    <Legend
      scale={scaleSequentialQuantile(randomExponentialData, interpolateBlues)}
      title="Quantile"
      tickFormat="decimal"
      variant="swatches"
    />
  </div>
</Preview>

<h2>scaleSqrt</h2>

<Preview>
  <div class="grid gap-6">
    <Legend scale={scaleSqrt([-100, 0, 100], ['blue', 'white', 'red'])} title="Temperature (°C)" />
    <Legend
      scale={scaleSqrt([-100, 0, 100], ['blue', 'white', 'red'])}
      title="Temperature (°C)"
      variant="swatches"
    />
  </div>
</Preview>

<h2>scaleQuantize</h2>

<Preview>
  <div class="grid gap-6">
    <Legend scale={scaleQuantize([1, 10], schemePurples[9])} title="Unemployment rate (%)" />
    <!-- TODO: Update Legend fix swatches for scaleQuantile -->
    <!-- <Legend
      scale={scaleQuantize([1, 10], schemePurples[9])}
      title="Unemployment rate (%)"
      variant="swatches"
    /> -->
  </div>
</Preview>

<h2>scaleQuantile</h2>

<Preview>
  <div class="grid gap-6">
    <Legend
      scale={scaleQuantile(randomNormalData, schemeSpectral[9])}
      title="Height (cm)"
      tickFormat="integer"
    />
    <!-- TODO: Update Legend fix swatches for scaleQuantile -->
    <!-- <Legend
      scale={scaleQuantile(randomNormalData, schemeSpectral[9])}
      title="Height (cm)"
      tickFormat="integer"
      variant="swatches"
    /> -->
  </div>
</Preview>

<h2>scaleThreshold</h2>

<Preview>
  <div class="grid gap-6">
    <Legend
      scale={scaleThreshold([2.5, 3.1, 3.5, 3.9, 6, 7, 8, 9.5], schemeRdBu[9])}
      title="Unemployment rate (%)"
      tickLength={0}
    />
    <!-- TODO: Update Legend fix swatches for scaleThreshold -->
    <!-- <Legend
      scale={scaleThreshold([2.5, 3.1, 3.5, 3.9, 6, 7, 8, 9.5], schemeRdBu[9])}
      title="Unemployment rate (%)"
      variant="swatches"
    /> -->
  </div>
</Preview>

<h2>scaleOrdinal</h2>

<Preview>
  <div class="grid gap-6">
    <Legend
      scale={scaleOrdinal(
        ['<10', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '≥80'],
        schemeSpectral[10]
      )}
      title="Age (years)"
      tickLength={0}
    />
    <Legend
      scale={scaleOrdinal(
        ['<10', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '≥80'],
        schemeSpectral[10]
      )}
      title="Age (years)"
      variant="swatches"
    />
  </div>
</Preview>

<h2>Chart integration</h2>

<Preview>
  <div class="h-[40px]">
    <Chart
      data={[{ name: 'One' }, { name: 'Two' }, { name: 'Three' }]}
      c="name"
      cScale={scaleOrdinal()}
      cRange={[
        'hsl(var(--color-success))',
        'hsl(var(--color-warning))',
        'hsl(var(--color-danger))',
      ]}
    >
      <Legend title="I am Legend" />
    </Chart>
  </div>
</Preview>

<h2>Chart placement</h2>

<Preview>
  <div class="h-[300px]">
    <Chart
      data={[{ name: 'One' }, { name: 'Two' }, { name: 'Three' }]}
      c="name"
      cScale={scaleOrdinal()}
      cRange={[
        'hsl(var(--color-success))',
        'hsl(var(--color-warning))',
        'hsl(var(--color-danger))',
      ]}
    >
      <Legend title="top-left" placement="top-left" variant="swatches" />
      <Legend title="top" placement="top" variant="swatches" />
      <Legend title="top-right" placement="top-right" variant="swatches" />
      <Legend title="left" placement="left" variant="swatches" />
      <Legend title="center" placement="center" variant="swatches" />
      <Legend title="right" placement="right" variant="swatches" />
      <Legend title="bottom-left" placement="bottom-left" variant="swatches" />
      <Legend title="bottom" placement="bottom" variant="swatches" />
      <Legend title="bottom-right" placement="bottom-right" variant="swatches" />
    </Chart>
  </div>
</Preview>

<h2>Square swatch</h2>

<Preview>
  <div class="grid gap-6">
    <Legend
      scale={scaleOrdinal(
        ['<10', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '≥80'],
        schemeSpectral[10]
      )}
      title="Age (years)"
      variant="swatches"
      classes={{ swatch: 'rounded' }}
    />
  </div>
</Preview>

<h2>Vertical orientation</h2>

<Preview>
  <div class="grid gap-6">
    <Legend
      scale={scaleOrdinal(
        ['<10', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '≥80'],
        schemeSpectral[10]
      )}
      title="Age (years)"
      variant="swatches"
      orientation="vertical"
    />
  </div>
</Preview>

<h2>Styling</h2>

<Preview>
  <Legend
    scale={scaleSequential([0, 100], interpolateViridis)}
    title="Temperature (°F)"
    width={600}
    tickFontSize={12}
    classes={{
      root: 'ml-10',
      title: 'text-lg text-center',
      label: 'fill-surface-content/50',
      tick: 'stroke-surface-100',
    }}
  />
</Preview>

<h2>slot override</h2>

<Preview>
  <Legend
    scale={scaleOrdinal(
      ['<10', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '≥80'],
      schemeSpectral[10]
    )}
    title="Age (years)"
    let:values
    let:scale
  >
    <div class="flex gap-4">
      {#each values as value}
        <div class="flex gap-1">
          <div class="h-4 w-4 rounded-full" style:background-color={scale(value)} />
          <div class="text-xs text-surface-content/50">{value}</div>
        </div>
      {/each}
    </div>
  </Legend>
</Preview>
