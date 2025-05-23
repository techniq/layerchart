<script lang="ts">
  import { scaleOrdinal } from 'd3-scale';
  import { randomUniform } from 'd3-random';
  import { forceX, forceY, forceManyBody, forceCollide, type SimulationNodeDatum } from 'd3-force';

  import { Chart, Circle, Group, ForceSimulation, Svg } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';

  const k = 600 / 200;
  const r = randomUniform(k, k * 4);
  const n = 4;
  const randomData = Array.from({ length: 200 }, (_, i) => ({ r: r(), group: i && (i % n) + 1 }));

  const groupColor = scaleOrdinal([
    'var(--color-info)',
    'var(--color-warning)',
    'var(--color-danger)',
  ]);

  const xForce = forceX().strength(0.01);
  const yForce = forceY().strength(0.01);
  const collideForce = forceCollide<SimulationNodeDatum & { r: number }>()
    .radius((d) => d.r + 1)
    .iterations(3);
  const manyBodyForce = forceManyBody();
</script>

<h1>Examples</h1>

<Preview data={randomData}>
  <div class="h-[600px] p-4 border rounded-sm overflow-hidden">
    <Chart data={randomData}>
      {#snippet children({ context })}
        <Svg>
          <ForceSimulation
            forces={{
              x: xForce,
              y: yForce,
              collide: collideForce,
              charge: manyBodyForce.strength((d, i) => (i ? 0 : (-context.width * 2) / 3)),
            }}
            alphaTarget={0.3}
            velocityDecay={0.1}
          >
            {#snippet children({ nodes, simulation })}
              <Group center>
                {#each nodes as node, i}
                  {#if i > 0}
                    <Circle cx={node.x} cy={node.y} r={node.r} fill={groupColor(node.group)} />
                  {/if}
                {/each}
              </Group>

              <rect
                width={context.width}
                height={context.height}
                onpointermove={(e) => {
                  simulation.nodes()[0].fx = e.offsetX - context.width / 2;
                  simulation.nodes()[0].fy = e.offsetY - context.height / 2;
                }}
                class="fill-transparent"
              />
            {/snippet}
          </ForceSimulation>
        </Svg>
      {/snippet}
    </Chart>
  </div>
</Preview>
