<script lang="ts">
  import { forceX, forceY, forceManyBody, forceCollide } from 'd3-force';

  import { Canvas, Chart, Circle, ForceSimulation, Points, Svg } from 'layerchart';
  import { Field, RangeField, Switch, TextField } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';

  import { rasterizeText, type RasterizeTextOptions } from '$lib/utils/string.js';
  import type { ChartResizeDetail } from '$lib/components/Chart.svelte';

  const collisionStrength = 0.01;

  let width = $state(960);
  let height = $state(500);
  let radius = $state(2);

  let hasCollideForce = $state(true);
  let hasChargeForce = $state(false);
  let transition = $state(false);

  function onResize(e: ChartResizeDetail) {
    width = e.width;
    height = e.height;
  }

  let mouseNode = $derived({
    x: 0,
    y: height / 2,
    xTarget: width,
    yTarget: height / 2,
    rTarget: 100,
  });

  let text = $state('LayerChart');
  let fontSize = $state(150);
  let spacing = $state(10);

  const textOptions = $derived({
    fontSize: fontSize + 'px',
    spacing: spacing,
    width: width,
    height: height,
  } satisfies RasterizeTextOptions);

  const pixels = $derived(
    rasterizeText(text, textOptions).map((d) => {
      return {
        x: transition ? d[0] : Math.random() * width,
        y: transition ? d[1] : Math.random() * height,
        xTarget: d[0],
        yTarget: d[1],
        rTarget: radius,
      };
    })
  );

  const data = $derived([mouseNode, ...pixels]);

  const xForce = forceX<(typeof pixels)[number]>((d) => d.xTarget).strength(collisionStrength);

  const yForce = forceY<(typeof pixels)[number]>((d) => d.yTarget).strength(collisionStrength);

  const collideForce = forceCollide<(typeof pixels)[number]>()
    .radius((d) => d.rTarget)
    .iterations(3);
  const manyBodyForce = forceManyBody();
</script>

<h1>Examples</h1>

<div class="grid grid-flow-col gap-2 mb-1">
  <TextField label="Text" bind:value={text} />
  <RangeField label="Font size (px)" bind:value={fontSize} max={600} />
  <RangeField label="Spacing" bind:value={spacing} />
  <RangeField label="Radius" bind:value={radius} min={1} max={spacing * 2} />
</div>
<div class="flex gap-2 mb-2">
  <Field label="Collide Force" let:id>
    <Switch bind:checked={hasCollideForce} {id} size="md" />
  </Field>
  <Field label="Charge Force" let:id>
    <Switch bind:checked={hasChargeForce} {id} size="md" />
  </Field>
  <!-- <Field label="Transition" let:id>
    <Switch bind:checked={transition} {id} size="md" />
  </Field> -->
</div>

<Preview {data}>
  <div class="h-[500px] p-4 border rounded-sm overflow-hidden">
    <Chart
      {data}
      x="x"
      xDomain={[0, 1]}
      xRange={[0, 1]}
      y="y"
      yDomain={[0, 1]}
      yRange={[0, 1]}
      {onResize}
    >
      {#snippet children({ context })}
        <ForceSimulation
          forces={{
            x: xForce,
            y: yForce,
            ...(hasCollideForce && {
              collide: collideForce,
            }),
            ...(hasChargeForce && {
              charge: manyBodyForce.strength((d, i) => (i ? 0 : (-context.width * 2) / 10)),
            }),
          }}
          data={{ nodes: data }}
          alphaTarget={1}
          velocityDecay={0.2}
        >
          {#snippet children({ nodes, simulation })}
            <Canvas>
              <!-- <Circle
                cx={nodes?.[0]?.x}
                cy={nodes?.[0]?.y}
                r={nodes?.[0]?.rTarget}
                class="fill-primary/10"
              /> -->
              <Points data={nodes.slice(1)} r={radius} class="fill-primary" />
            </Canvas>

            <Svg>
              <rect
                width={context.width}
                height={context.height}
                onpointermove={(e) => {
                  simulation.nodes()[0].fx = e.offsetX;
                  simulation.nodes()[0].fy = e.offsetY;
                }}
                class="fill-transparent"
              />
            </Svg>
          {/snippet}
        </ForceSimulation>
      {/snippet}
    </Chart>
  </div>
</Preview>
