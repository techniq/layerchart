<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { curveBasis } from 'd3-shape';
  import { cubicOut } from 'svelte/easing';
  import { cls } from '@layerstack/tailwind';

  import { Chart, Dagre, Group, Rect, Spline, Svg, Text, Tooltip } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import CurveMenuField from '$lib/docs/CurveMenuField.svelte';
  import DagreControls from './DagreControls.svelte';
  import TransformControls from 'layerchart/components/TransformControls.svelte';

  export let data;

  let ranker: ComponentProps<Dagre>['ranker'] = 'network-simplex';
  let direction: ComponentProps<Dagre>['direction'] = 'left-right';
  let align: ComponentProps<Dagre>['align'] = 'up-left';
  let nodeSeparation: ComponentProps<Dagre>['nodeSeparation'] = 50;
  let rankSeparation: ComponentProps<Dagre>['rankSeparation'] = 50;
  let edgeSeparation: ComponentProps<Dagre>['rankSeparation'] = 10;
  let curve: ComponentProps<CurveMenuField>['value'] = curveBasis;
</script>

<h1>Examples</h1>

<h2>Simple</h2>

<Preview data={data.basic}>
  <DagreControls
    bind:ranker
    bind:direction
    bind:align
    bind:nodeSeparation
    bind:rankSeparation
    bind:edgeSeparation
    bind:curve
    class="grid-cols-sm mb-2"
  />

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
        <Dagre
          data={data.basic}
          edges={(d) => d.links}
          {ranker}
          {direction}
          {align}
          {nodeSeparation}
          {rankSeparation}
          {edgeSeparation}
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
                {curve}
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
