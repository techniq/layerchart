<script lang="ts">
  import { forceX, forceY, forceManyBody, forceCollide } from 'd3-force';

  import { Chart, Circle, ForceSimulation, Svg } from 'layerchart';
  import { RangeField, TextField } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';

  import type { ChartResizeEvent } from 'layerchart/components/ChartContext.svelte';
  import { rasterizeText, type RasterizeTextOptions } from 'layerchart/utils/string.js';

  let width = 960;
  let height = 500;
  let radius = 2;
  const collisionStrength = 0.01;

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
      x: Math.random() * width,
      y: Math.random() * height,
      // x: d[0],
      // y: d[1],
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

<div class="grid grid-flow-col gap-2 mb-2">
  <TextField label="Text" bind:value={text} />
  <RangeField label="Font size (px)" bind:value={fontSize} max={600} />
  <RangeField label="Spacing" bind:value={spacing} />
  <RangeField label="Radius" bind:value={radius} min={1} max={spacing * 2} />
</div>

<Preview {data}>
  <div class="h-[500px] p-4 border rounded overflow-hidden">
    <Chart {data} let:width let:height on:resize={onResize}>
      <Svg>
        <ForceSimulation
          forces={{
            x: xForce,
            y: yForce,
            collide: collideForce,
            // charge: manyBodyForce.strength((d, i) => (i ? 0 : (-width * 2) / 10)),
          }}
          alphaTarget={1}
          velocityDecay={0.2}
          let:nodes
        >
          {#each nodes as node, i}
            {#if i > 0}
              <Circle cx={node.x} cy={node.y} r={node.rTarget} fill="hsl(var(--color-primary))" />
            {/if}
          {/each}

          <rect
            {width}
            {height}
            on:pointermove={(e) => {
              mouseNode.xTarget = e.offsetX;
              mouseNode.yTarget = e.offsetY;
            }}
            class="fill-transparent"
          />
        </ForceSimulation>
      </Svg>
    </Chart>
  </div>
</Preview>
