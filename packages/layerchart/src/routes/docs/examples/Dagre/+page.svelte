<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { curveBasis, curveLinear } from 'd3-shape';
  import { cubicOut } from 'svelte/easing';
  import { cls } from '@layerstack/tailwind';

  import { Chart, Dagre, Group, Rect, Spline, Svg, Text, Tooltip } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import DagreControls from './DagreControls.svelte';
  import TransformControls from 'layerchart/components/TransformControls.svelte';

  export let data;

  let settings = {
    simple: {
      ranker: 'network-simplex',
      direction: 'left-right',
      align: 'up-left',
      nodeSeparation: 50,
      rankSeparation: 50,
      edgeSeparation: 10,
      edgeLabelPosition: 'center',
      edgeLabelOffset: 10,
      curve: curveBasis,
    },
    tcpState: {
      ranker: 'network-simplex',
      direction: 'top-bottom',
      align: 'none',
      nodeSeparation: 50,
      rankSeparation: 50,
      edgeSeparation: 10,
      edgeLabelPosition: 'center',
      edgeLabelOffset: 10,
      curve: curveLinear,
    },
  } as Record<string, ComponentProps<DagreControls>['settings']>;
</script>

<h1>Examples</h1>

<h2>Simple</h2>

<Preview data={data.basic}>
  <DagreControls bind:settings={settings.simple} class="grid-cols-sm mb-2" />

  <div class="h-[500px] p-4 border rounded overflow-hidden">
    <Chart
      data={data.basic}
      transform={{
        mode: 'canvas',
        initialScrollMode: 'scale',
        tweened: { duration: 800, easing: cubicOut },
      }}
      let:tooltip
    >
      <TransformControls />

      <Svg>
        <Dagre data={data.basic} edges={(d) => d.links} {...settings.simple} let:nodes let:edges>
          <g class="edges">
            {#each edges as edge, i (edge.v + '-' + edge.w)}
              <Spline
                data={edge.points}
                x="x"
                y="y"
                class="stroke-surface-content/30"
                tweened
                curve={settings.simple?.curve}
                markerEnd="arrow"
              />
            {/each}
          </g>

          <g class="nodes">
            {#each nodes as node (node.label)}
              <Group
                x={node.x - node.width / 2}
                y={node.y - node.height / 2}
                tweened
                class="group"
                on:click={() => {
                  // @ts-expect-error
                  selectedNode = node;
                }}
                on:pointermove={(e) => {
                  // highlightType = node.id;
                  tooltip.show(e, node);
                }}
                on:pointerleave={() => {
                  // highlightType = null;
                  tooltip.hide();
                }}
              >
                <Rect
                  width={node.width}
                  height={node.height}
                  class={cls(
                    'fill-surface-200 stroke-2 stroke-primary/50 group-hover:fill-primary/10 group-hover:cursor-pointer'
                    // highlightType &&
                    //   (highlightType === node.id
                    //     ? 'stroke-secondary/50 group-hover:fill-secondary/10'
                    //     : 'opacity-30')
                  )}
                  rx={10}
                />

                <Text
                  value={node.label}
                  x={node.width / 2}
                  y={node.height / 2}
                  dy={-2}
                  textAnchor="middle"
                  verticalAnchor="middle"
                  class={cls('text-xs pointer-events-none')}
                />
              </Group>
            {/each}
          </g>
        </Dagre>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>TCP State Diagram</h2>

<!-- https://dagrejs.github.io/project/dagre-d3/latest/demo/tcp-state-diagram.html -->

<Preview data={data.tcpState}>
  <DagreControls bind:settings={settings.tcpState} class="grid-cols-sm mb-2" />

  <div class="h-[700px] p-4 border rounded overflow-hidden">
    <Chart
      data={data.tcpState}
      transform={{
        mode: 'canvas',
        initialScale: 0.75,
        initialTranslate: { x: 0, y: -110 },
        initialScrollMode: 'scale',
        tweened: { duration: 800, easing: cubicOut },
      }}
    >
      <TransformControls />

      <Svg>
        <Dagre
          data={data.tcpState}
          edges={(d) => d.links}
          {...settings.tcpState}
          let:nodes
          let:edges
        >
          <g class="edges">
            {#each edges as edge, i (edge.v + '-' + edge.w)}
              <Spline
                data={edge.points}
                x="x"
                y="y"
                class="stroke-surface-content/30"
                tweened
                curve={settings.tcpState?.curve}
                markerEnd="triangle"
              />

              <!-- Label background -->
              <!-- <Rect
                x={edge.x - edge.width / 2}
                y={edge.y - edge.height / 2}
                width={edge.width}
                height={edge.height}
                class="fill-surface-100"
              /> -->
              <Text
                value={edge.label}
                x={edge.x}
                y={edge.y}
                textAnchor="middle"
                verticalAnchor="middle"
                class="stroke-2 stroke-surface-100"
                {...settings.simple}
                tweened
              />
            {/each}
          </g>

          <g class="nodes">
            {#each nodes as node (node.label)}
              <Group x={node.x - node.width / 2} y={node.y - node.height / 2} tweened>
                <Rect
                  width={node.width}
                  height={node.height}
                  class={cls(
                    'fill-surface-200 stroke-2 stroke-primary/50',
                    node.label === 'CLOSED' && 'fill-danger/10 stroke-danger/50',
                    node.label === 'ESTAB' && 'fill-success/10 stroke-success/50'
                  )}
                  rx={10}
                />

                <Text
                  value={node.label}
                  x={node.width / 2}
                  y={node.height / 2}
                  dy={-2}
                  textAnchor="middle"
                  verticalAnchor="middle"
                  class={cls('text-xs pointer-events-none')}
                />
              </Group>
            {/each}
          </g>
        </Dagre>
      </Svg>
    </Chart>
  </div>
</Preview>
