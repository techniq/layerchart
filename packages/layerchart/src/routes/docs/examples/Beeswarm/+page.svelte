<script lang="ts">
  import { scaleOrdinal } from 'd3-scale';
  import { forceX, forceY, forceCollide, type SimulationNodeDatum } from 'd3-force';

  import { asAny, Axis, Chart, Circle, ForceSimulation, Svg, Tooltip } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import type { USSenatorsDatum } from '$static/data/examples/us-senators.js';
  import type { Prettify } from '@layerstack/utils';

  type NodeDatum = USSenatorsDatum;

  type MySimulationNodeDatum = Prettify<NodeDatum & SimulationNodeDatum>;

  let { data } = $props();

  const nodes: MySimulationNodeDatum[] = data.usSenators;

  const genderColor = scaleOrdinal(['var(--color-info)', 'var(--color-warning)']);

  const xForce = forceX<MySimulationNodeDatum>().strength(0.95);
  const yForce = forceY<MySimulationNodeDatum>().strength(0.075);
  const collideForce = forceCollide<MySimulationNodeDatum>();
</script>

<h1>Examples</h1>

<Preview data={data.usSenators}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={data.usSenators}
      x={(d) => d.date_of_birth.getFullYear()}
      xNice
      padding={{ bottom: 12, left: 8, right: 8 }}
    >
      {#snippet children({ context })}
        {@const r = 6}
        <Svg>
          <Axis placement="bottom" format="none" rule grid />
          <ForceSimulation
            forces={{
              x: xForce.x((d) => context.xGet(asAny(d))),
              y: yForce.y(context.height / 2),
              collide: collideForce.radius(r),
            }}
            data={{ nodes }}
            static
          >
            {#snippet children({ nodes })}
              {#each nodes as node}
                <Circle
                  cx={node.x}
                  cy={node.y}
                  {r}
                  fill={genderColor(node.gender)}
                  class="stroke-surface-100"
                  onpointermove={(e) => context.tooltip.show(e, node)}
                  onpointerleave={context.tooltip.hide}
                />
              {/each}
            {/snippet}
          </ForceSimulation>
        </Svg>

        <Tooltip.Root {context}>
          {#snippet children({ data })}
            <Tooltip.Header>{data.name}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="Birth date" value={data.date_of_birth} format="day" />
              <Tooltip.Item label="State" value={data.state_name} />
              <Tooltip.Item label="Party" value={data.party} />
              <Tooltip.Item label="Gender" value={data.gender} />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>
