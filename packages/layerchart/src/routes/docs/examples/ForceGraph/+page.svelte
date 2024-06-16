<script lang="ts">
  import { forceManyBody, forceLink, forceCenter } from 'd3-force';
  import { curveLinear } from 'd3-shape';
  import { scaleOrdinal } from 'd3-scale';
  import { schemeCategory10 } from 'd3-scale-chromatic';

  import { Chart, Circle, ForceSimulation, Link, Svg, Tooltip, TooltipItem } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;

  const { nodes, links } = data.miserables;

  const colorScale = scaleOrdinal(schemeCategory10);
</script>

<h1>Examples</h1>

<Preview data={data.miserables}>
  <div class="h-[600px] p-4 border rounded">
    <Chart data={nodes} let:width let:height let:tooltip>
      <Svg>
        <ForceSimulation
          forces={{
            link: forceLink(links).id((d) => d.id),
            charge: forceManyBody(),
            center: forceCenter(width / 2, height / 2),
          }}
          let:nodes
        >
          {#key nodes}
            {#each links as link}
              <Link data={link} class="stroke-surface-content/50" curve={curveLinear} />
            {/each}
          {/key}

          {#each nodes as node}
            <Circle
              cx={node.x}
              cy={node.y}
              r={3}
              fill={colorScale(node.group)}
              on:pointermove={(e) => tooltip.show(e, node)}
              on:pointerleave={tooltip.hide}
            />
          {/each}
        </ForceSimulation>
      </Svg>

      <Tooltip header={(d) => d.id} />
    </Chart>
  </div>
</Preview>
