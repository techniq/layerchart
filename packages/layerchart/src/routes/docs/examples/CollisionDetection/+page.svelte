<script lang="ts">
  import { scaleOrdinal } from 'd3-scale';
  import { randomUniform } from 'd3-random';
  import { forceX, forceY, forceManyBody, forceCollide } from 'd3-force';

  import { Chart, Circle, Group, ForceSimulation, Svg } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';

  const k = 600 / 200;
  const r = randomUniform(k, k * 4);
  const n = 4;
  const randomData = Array.from({ length: 200 }, (_, i) => ({ r: r(), group: i && (i % n) + 1 }));

  const groupColor = scaleOrdinal([
    'hsl(var(--color-info))',
    'hsl(var(--color-warning))',
    'hsl(var(--color-danger))',
  ]);
</script>

<h1>Examples</h1>

<Preview data={randomData}>
  <div class="h-[600px] p-4 border rounded overflow-hidden">
    <Chart data={randomData} let:width let:height>
      <Svg>
        <ForceSimulation
          forces={{
            x: forceX().strength(0.01),
            y: forceY().strength(0.01),
            collide: forceCollide()
              .radius((d) => d.r + 1)
              .iterations(3),
            charge: forceManyBody().strength((d, i) => (i ? 0 : (-width * 2) / 3)),
          }}
          alphaTarget={0.3}
          velocityDecay={0.1}
          let:nodes
        >
          <Group center>
            {#each nodes as node, i}
              {#if i > 0}
                <Circle cx={node.x} cy={node.y} r={node.r} fill={groupColor(node.group)} />
              {/if}
            {/each}
          </Group>

          <rect
            {width}
            {height}
            on:pointermove={(e) => {
              nodes[0].fx = e.offsetX - width / 2;
              nodes[0].fy = e.offsetY - height / 2;
            }}
            class="fill-transparent"
          />
        </ForceSimulation>
      </Svg>
    </Chart>
  </div>
</Preview>
