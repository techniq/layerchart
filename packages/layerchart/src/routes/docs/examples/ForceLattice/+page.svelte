<script lang="ts">
  import { forceManyBody, forceLink } from 'd3-force';
  import { curveLinear } from 'd3-shape';

  import { Chart, Circle, ForceSimulation, Link, Svg } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';

  const n = 20;
  const nodes = Array.from({ length: n * n }, (_, i) => ({ index: i }));
  const links: { source: number; target: number }[] = [];
  for (let y = 0; y < n; ++y) {
    for (let x = 0; x < n; ++x) {
      if (y > 0) links.push({ source: (y - 1) * n + x, target: y * n + x });
      if (x > 0) links.push({ source: y * n + (x - 1), target: y * n + x });
    }
  }

  const chargeForce = forceManyBody().strength(-20);
  const linkForce = forceLink(links).strength(1).distance(20).iterations(10);
</script>

<h1>Examples</h1>

<Preview data={nodes}>
  <div class="h-[800px] p-4 border rounded-sm overflow-hidden">
    <Chart data={nodes}>
      <Svg center>
        <ForceSimulation
          data={{ nodes, links }}
          forces={{
            charge: chargeForce,
            link: linkForce,
          }}
        >
          {#snippet children({ nodes, linkPositions })}
            {#each links as link, i (i)}
              <Link
                explicitCoords={linkPositions[i]}
                data={link}
                class="stroke-surface-content/20"
                curve={curveLinear}
              />
            {/each}

            {#each nodes as node}
              <Circle cx={node.x} cy={node.y} r={3} class="fill-surface-content" />
            {/each}
          {/snippet}
        </ForceSimulation>
      </Svg>
    </Chart>
  </div>
</Preview>
