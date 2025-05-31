<script lang="ts">
  import {
    forceManyBody,
    forceLink,
    forceX,
    forceY,
    type SimulationNodeDatum,
    type SimulationLinkDatum,
  } from 'd3-force';
  import { curveLinear } from 'd3-shape';
  import { scaleOrdinal } from 'd3-scale';
  import { schemeCategory10 } from 'd3-scale-chromatic';

  import { Chart, Circle, ForceSimulation, Link, Svg } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';

  let { data } = $props();

  type Node = {
    id: string;
    group: number;
  };

  type Link = {
    source: string;
    target: string;
    value: number;
  };

  const nodes: (Node & SimulationNodeDatum)[] = data.miserables.nodes;
  const links: (Link & SimulationLinkDatum<Node & SimulationNodeDatum>)[] = data.miserables.links;

  const colorScale = scaleOrdinal(schemeCategory10);

  // @ts-expect-error - TODO: can we fix these types
  const linkForce = $derived(forceLink(links).id((d) => d.id));
  const chargeForce = forceManyBody().strength(-30).theta(0.9);
  const xForce = forceX();
  const yForce = forceY();

  function keyForLink(link: Link & SimulationLinkDatum<Node & SimulationNodeDatum>): any {
    return link.value + link.index!;
  }
</script>

<h1>Examples</h1>

<!-- <pre>
	{JSON.stringify(links, null, 2)}
</pre> -->

<Preview data={data.miserables}>
  <div class="h-[680px] p-4 border rounded-sm">
    <Chart>
      <Svg center>
        <ForceSimulation
          forces={{
            link: linkForce,
            charge: chargeForce,
            x: xForce,
            y: yForce,
          }}
          data={{ nodes, links }}
        >
          {#snippet children({ nodes, links, linkPositions })}
            {#each links as link, i (keyForLink(link))}
              <Link
                data={link}
                explicitCoords={linkPositions[i]}
                class="stroke-surface-content/50"
                curve={curveLinear}
              />
            {/each}

            {#each nodes as node}
              <Circle cx={node.x} cy={node.y} r={3} fill={colorScale(node.group.toString())} />
            {/each}
          {/snippet}
        </ForceSimulation>
      </Svg>
    </Chart>
  </div>
</Preview>
