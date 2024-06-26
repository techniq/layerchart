<script lang="ts">
  import { scaleBand, scaleOrdinal } from 'd3-scale';
  import { rollup } from 'd3-array';
  import { quantize } from 'd3-interpolate';
  import {
    interpolateInferno,
    interpolateRainbow,
    interpolateRdBu,
    interpolateSpectral,
    interpolateViridis,
    schemeSpectral,
    schemeTableau10,
  } from 'd3-scale-chromatic';

  import {
    PeriodType,
    NumberStepper,
    sort,
    format,
    timerStore,
    ButtonGroup,
    Button,
    Field,
    Switch,
  } from 'svelte-ux';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Bar from '$lib/components/Bar.svelte';
  import Group from '$lib/components/Group.svelte';
  import Highlight from '$lib/components/Highlight.svelte';
  import Preview from '$lib/docs/Preview.svelte';
  import Text from '$lib/components/Text.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  import Labels from '$lib/components/Labels.svelte';
  import Rule from '$lib/components/Rule.svelte';
  import ChartClipPath from '$lib/components/ChartClipPath.svelte';

  export let data;

  const duration = 250;
  let xNice = false;

  const frameTimer = timerStore({
    initial: 0,
    onTick: (value) => {
      if (value == null || value >= data.keyframes.length - 1) {
        frameTimer.stop();
        return value;
      } else {
        return value + 1;
      }
    },
    delay: duration,
    disabled: true,
  });
  $: ({ isRunning } = frameTimer);

  $: keyframe = data.keyframes[$frameTimer];
  $: chartData = sort(keyframe?.data ?? [], (d) => d.value, 'desc');

  const categoryByName = rollup(
    data.data,
    (values) => values[0].category,
    (d) => d.name
  );
  // const colors = schemeTableau10;
  const colors = schemeSpectral[10];
  // const colors = quantize(interpolateSpectral, 10);
  const colorScale = scaleOrdinal()
    .domain(Array.from(categoryByName.values()).sort())
    .range(colors);

  $: console.log({ data, keyframe, chartData });
</script>

<h1>Examples</h1>

<div class="grid grid-cols-[1fr,auto,auto] items-center mb-2">
  <div class="flex items-center gap-3">
    <ButtonGroup variant="fill-light" class="ml-3">
      <Button on:click={frameTimer.start} disabled={$isRunning}>Start</Button>
      <Button on:click={frameTimer.stop} disabled={!$isRunning}>Stop</Button>
    </ButtonGroup>
    <Button on:click={frameTimer.reset}>Reset</Button>

    <NumberStepper
      value={$frameTimer}
      on:change={(e) => {
        $frameTimer = e.detail.value;
      }}
    />

    <Field let:id>
      <label class="flex gap-2 items-center text-sm">
        Nice
        <Switch bind:checked={xNice} {id} />
      </label>
    </Field>
  </div>

  <div class="text-xl">{format(keyframe?.date, PeriodType.MonthYear)}</div>
</div>

<Preview data={chartData}>
  <div class="h-[500px] p-4 border rounded">
    <Chart
      data={chartData}
      x="value"
      xDomain={[0, null]}
      {xNice}
      y="name"
      yScale={scaleBand().padding(0.1)}
      yDomain={chartData.map((d) => d.name)}
      padding={{ top: 14, left: 4, right: 24 }}
      tooltip={{ mode: 'band' }}
    >
      <Svg>
        <ChartClipPath _height={272}>
          <g>
            {#each chartData as d (d.name)}
              <Bar
                bar={d}
                radius={2}
                fill={colorScale(categoryByName.get(d.name))}
                fill-opacity={0.9}
                class="stroke-1 stroke-surface-content/50"
                tweened={{ duration }}
              />
            {/each}
          </g>
          <!-- <Axis placement="left" rule tweened={{ duration }} /> -->
          <Rule x />
          <Axis placement="top" grid rule tweened={{ duration }} />
          <Highlight area />
          <!-- <Labels tweened format="integer" placement="inside" /> -->
          <Labels tweened format="integer" placement="inside" let:data let:position let:textProps>
            <Group {...position} tweened={{ duration }}>
              <Text value={data.name} class="fill-black/50 mix-blend-multiply" {...textProps} />
            </Group>
          </Labels>
        </ChartClipPath>
      </Svg>

      <Tooltip header={(d) => d.name} let:data>
        <TooltipItem label="value" value={data.value} format="integer" />
        <TooltipItem label="category" value={categoryByName.get(data.name)} />
      </Tooltip>
    </Chart>
  </div>
</Preview>
