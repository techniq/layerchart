<script lang="ts">
  import { forceManyBody, forceLink, forceX, forceY } from 'd3-force';
  import { curveLinear } from 'd3-shape';
  import { scaleOrdinal } from 'd3-scale';
  import { schemeCategory10 } from 'd3-scale-chromatic';

  import { Chart, Circle, ForceSimulation, Group, Link, Svg } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;

  const { nodes, links } = data.miserables;

  const colorScale = scaleOrdinal(schemeCategory10);
</script>

<h1>Examples</h1>

<Preview data={data.miserables}>
  <div class="h-[680px] p-4 border rounded">
    <Chart data={nodes}>
      <Svg>
        <ForceSimulation
          forces={{
            link: forceLink(links).id((d) => d.id),
            charge: forceManyBody(),
            x: forceX(),
            y: forceY(),
          }}
          let:nodes
        >
          <Group center>
            {#key nodes}
              {#each links as link}
                <Link data={link} class="stroke-surface-content/50" curve={curveLinear} />
              {/each}
            {/key}

            {#each nodes as node}
              <Circle cx={node.x} cy={node.y} r={3} fill={colorScale(node.group)} />
            {/each}
          </Group>
        </ForceSimulation>
      </Svg>
    </Chart>
  </div>
</Preview>
