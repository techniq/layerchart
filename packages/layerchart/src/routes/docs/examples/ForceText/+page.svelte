<script lang="ts">
  import { forceX, forceY, forceManyBody, forceCollide } from 'd3-force';

  import { Canvas, Chart, ForceSimulation, Points, Svg } from 'layerchart';
  import { Field, RangeField, Switch, TextField } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';

  import { rasterizeText, type RasterizeTextOptions } from '$lib/utils/string.js';
  import type { ChartResizeDetail } from '$lib/components/Chart.svelte';

  let config = $state({
    width: 960,
    height: 500,
    radius: 2,
    collisionStrength: 0.01,
    hasCollideForce: false,
    hasChargeForce: false,
    transition: false,
    text: 'LayerChart',
    fontSize: 150,
    spacing: 10,
  });

  function onResize(e: ChartResizeDetail) {
    config.width = e.width;
    config.height = e.height;
  }

  let mouseNode = $state({
    x: 0,
    y: config.height / 2,
    xTarget: config.width,
    yTarget: config.height / 2,
    rTarget: 100,
  });

  let text = 'LayerChart';
  let fontSize = 150;
  let spacing = 10;
  const textOptions = $derived({
    fontSize: config.fontSize + 'px',
    spacing: config.spacing,
    width: config.width,
    height: config.height,
  } satisfies RasterizeTextOptions);

  const pixels = $derived(
    rasterizeText(text, textOptions).map((d) => {
      return {
        x: config.transition ? d[0] : Math.random() * config.width,
        y: config.transition ? d[1] : Math.random() * config.height,
        xTarget: d[0],
        yTarget: d[1],
        rTarget: config.radius,
      };
    })
  );

  const data = $derived([mouseNode, ...pixels]);

  const xForce = $derived(
    forceX<(typeof pixels)[number]>((d) => d.xTarget).strength(config.collisionStrength)
  );
  const yForce = $derived(
    forceY<(typeof pixels)[number]>((d) => d.yTarget).strength(config.collisionStrength)
  );

  const collideForce = forceCollide<(typeof pixels)[number]>()
    .radius((d) => d.rTarget)
    .iterations(3);
  const manyBodyForce = forceManyBody();
</script>

<h1>Examples</h1>

<div class="grid grid-flow-col gap-2 mb-1">
  <TextField label="Text" bind:value={config.text} />
  <RangeField label="Font size (px)" bind:value={config.fontSize} max={600} />
  <RangeField label="Spacing" bind:value={config.spacing} />
  <RangeField label="Radius" bind:value={config.radius} min={1} max={spacing * 2} />
</div>
<div class="flex gap-2 mb-2">
  <Field label="Collide Force" let:id>
    <Switch bind:checked={config.hasCollideForce} {id} size="md" />
  </Field>
  <Field label="Charge Force" let:id>
    <Switch bind:checked={config.hasChargeForce} {id} size="md" />
  </Field>
  <!-- <Field label="Transition" let:id>
    <Switch bind:checked={transition} {id} size="md" />
  </Field> -->
</div>

<Preview {data}>
  <div class="h-[500px] p-4 border rounded-sm overflow-hidden">
    <Chart
      x="x"
      xDomain={[0, 1]}
      xRange={[0, 1]}
      y="y"
      yDomain={[0, 1]}
      yRange={[0, 1]}
      {data}
      {onResize}
    >
      {#snippet children({ context })}
        <ForceSimulation
          forces={{
            x: xForce,
            y: yForce,
            ...(config.hasCollideForce && {
              collide: collideForce,
            }),
            ...(config.hasChargeForce && {
              charge: manyBodyForce.strength((d, i) => (i ? 0 : (-context.width * 2) / 10)),
            }),
          }}
          alphaTarget={1}
          velocityDecay={0.2}
        >
          {#snippet children({ nodes })}
            <Canvas>
              <Points data={nodes.slice(1)} r={config.radius} class="fill-primary" />
            </Canvas>

            <Svg>
              <!-- {#each nodes.slice(1) as node, i (i)}
            <Circle
              cx={node.x}
              cy={node.y}
              r={node.rTarget}
              class="fill-primary"
              spring={transition}
            />
          {/each} -->

              <rect
                width={context.width}
                height={context.height}
                onpointermove={(e) => {
                  mouseNode.xTarget = e.offsetX;
                  mouseNode.yTarget = e.offsetY;
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
