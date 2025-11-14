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

  import { Chart, Circle, ForceSimulation, Link, Layer } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import type { Prettify } from '@layerstack/utils';
  import { shared } from '../../shared.svelte.js';

  let { data } = $props();

  type NodeDatum = {
    id: string;
    group: number;
  };

  type LinkDatum = {
    source: string;
    target: string;
    value: number;
  };

  type MySimulationNodeDatum = Prettify<NodeDatum & SimulationNodeDatum>;
  type MySimulationLinkDatum = Prettify<
    LinkDatum & SimulationLinkDatum<NodeDatum & SimulationNodeDatum>
  >;

  const nodes: MySimulationNodeDatum[] = data.miserables.nodes;
  const links: MySimulationLinkDatum[] = data.miserables.links;

  const colorScale = scaleOrdinal(schemeCategory10);

  const linkForce = $derived(
    forceLink<MySimulationNodeDatum, MySimulationLinkDatum>(links).id((d) => d.id)
  );
  const chargeForce = forceManyBody<MySimulationNodeDatum>().strength(-30).theta(0.9);
  const xForce = forceX<MySimulationNodeDatum>();
  const yForce = forceY<MySimulationNodeDatum>();

  function keyForLink(link: MySimulationLinkDatum): any {
    return link.value + link.index!;
  }
</script>

<h1>Examples</h1>

<Preview data={data.miserables}>
  <div class="h-[680px] p-4 border rounded-sm">
    <Chart>
      <Layer type={shared.renderContext} center>
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
      </Layer>
    </Chart>
  </div>
</Preview>
