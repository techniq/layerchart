<script lang="ts">
  import { forceManyBody, forceLink, forceX, forceY } from 'd3-force';
  import { curveLinear } from 'd3-shape';
  import { scaleOrdinal } from 'd3-scale';
  import { schemeCategory10 } from 'd3-scale-chromatic';

  import { Chart, Circle, ForceSimulation, Link, Svg } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;

  const { nodes, links } = data.miserables;

  const colorScale = scaleOrdinal(schemeCategory10);

  // @ts-expect-error
  const linkForce = forceLink(links).id((d) => d.id);
  const chargeForce = forceManyBody();
  const xForce = forceX();
  const yForce = forceY();
</script>

<h1>Examples</h1>

<Preview data={data.miserables}>
  <div class="h-[680px] p-4 border rounded-sm">
    <Chart data={nodes}>
      <Svg center>
        <ForceSimulation
          forces={{
            link: linkForce,
            charge: chargeForce,
            x: xForce,
            y: yForce,
          }}
          let:nodes
        >
          {#key nodes}
            {#each links as link}
              <Link data={link} class="stroke-surface-content/50" curve={curveLinear} />
            {/each}
          {/key}

          {#each nodes as node}
            <Circle cx={node.x} cy={node.y} r={3} fill={colorScale(node.group)} />
          {/each}
        </ForceSimulation>
      </Svg>
    </Chart>
  </div>
</Preview>
