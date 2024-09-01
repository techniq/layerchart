<script lang="ts">
  import { forceX, forceY, forceManyBody, forceCollide } from 'd3-force';

  import { Canvas, Chart, Circle, ForceSimulation, Points, Svg } from 'layerchart';
  import { Field, RangeField, Switch, TextField } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';

  import type { ChartResizeEvent } from 'layerchart/components/ChartContext.svelte';
  import { rasterizeText, type RasterizeTextOptions } from 'layerchart/utils/string.js';

  let width = 960;
  let height = 500;
  let radius = 2;
  const collisionStrength = 0.01;

  let hasCollideForce = false; // TODO: Determine why unable to remove if enabled true by default
  let hasChargeForce = false;
  let transition = false;

  function onResize(e: ChartResizeEvent) {
    width = e.detail.width;
    height = e.detail.height;
  }

  let mouseNode = {
    x: 0,
    y: height / 2,
    xTarget: width,
    yTarget: height / 2,
    rTarget: 100,
  };

  let text = 'LayerChart';
  let fontSize = 150;
  let spacing = 10;
  $: textOptions = {
    fontSize: fontSize + 'px',
    spacing,
    width,
    height,
  } satisfies RasterizeTextOptions;

  $: pixels = rasterizeText(text, textOptions).map(function (d) {
    return {
      x: transition ? d[0] : Math.random() * width,
      y: transition ? d[1] : Math.random() * height,
      xTarget: d[0],
      yTarget: d[1],
      rTarget: radius,
    };
  });
  $: data = [mouseNode, ...pixels];

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
  <div class="h-[500px] p-4 border rounded overflow-hidden">
    <Chart
      x="x"
      xDomain={[0, 1]}
      xRange={[0, 1]}
      y="y"
      yDomain={[0, 1]}
      yRange={[0, 1]}
      {data}
      let:width
      let:height
      on:resize={onResize}
    >
      <ForceSimulation
        forces={{
          x: xForce,
          y: yForce,
          ...(hasCollideForce && {
            collide: collideForce,
          }),
          ...(hasChargeForce && {
            charge: manyBodyForce.strength((d, i) => (i ? 0 : (-width * 2) / 10)),
          }),
        }}
        alphaTarget={1}
        velocityDecay={0.2}
        let:nodes
      >
        <Canvas>
          <Points data={nodes.slice(1)} r={radius} class="fill-primary" />
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
            {width}
            {height}
            on:pointermove={(e) => {
              mouseNode.xTarget = e.offsetX;
              mouseNode.yTarget = e.offsetY;
            }}
            class="fill-transparent"
          />
        </Svg>
      </ForceSimulation>
    </Chart>
  </div>
</Preview>
