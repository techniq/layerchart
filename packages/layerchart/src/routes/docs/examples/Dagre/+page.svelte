<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { curveBasis, curveLinear } from 'd3-shape';
  import { cubicOut } from 'svelte/easing';
  import { slide } from 'svelte/transition';
  import { cls } from '@layerstack/tailwind';

  import { Chart, Dagre, Group, Rect, Spline, Svg, Text, Tooltip } from 'layerchart';
  import { Field, MenuField, Switch, Toggle } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';
  import DagreControls from './DagreControls.svelte';
  import TransformControls from '$lib/components/TransformControls.svelte';

  let { data } = $props();

  let selectedGraphValue: keyof typeof data = $state('simple');
  const selectedGraph = $derived(data[selectedGraphValue]);

  let settings = $state({
    playground: {
      ranker: 'network-simplex',
      direction: 'left-right',
      align: 'up-left',
      nodeSeparation: 50,
      rankSeparation: 50,
      edgeSeparation: 10,
      edgeLabelPosition: 'center',
      edgeLabelOffset: 10,
      curve: curveBasis,
      arrow: 'arrow',
    },
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
      arrow: 'arrow',
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
      arrow: 'triangle',
    },
    softwareUserFlow: {
      ranker: 'network-simplex',
      direction: 'top-bottom',
      align: 'none',
      nodeSeparation: 50,
      rankSeparation: 50,
      edgeSeparation: 10,
      edgeLabelPosition: 'center',
      edgeLabelOffset: 10,
      curve: curveLinear,
      arrow: 'triangle',
    },
    cluster: {
      ranker: 'network-simplex',
      direction: 'top-bottom',
      align: 'none',
      nodeSeparation: 50,
      rankSeparation: 50,
      edgeSeparation: 10,
      edgeLabelPosition: 'center',
      edgeLabelOffset: 10,
      curve: curveLinear,
      arrow: 'arrow',
    },
  }) satisfies Record<string, ComponentProps<typeof DagreControls>['settings']>;
</script>

<h1>Examples</h1>

<Toggle let:on={showSettings} let:toggle>
  <div class="grid grid-cols-[1fr_256px_auto] gap-2 items-end mb-1">
    <h2>Playground</h2>

    <MenuField
      label="Graph"
      options={[
        { label: 'Simple', value: 'simple' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
        { label: 'Les Misérables', value: 'miserables' },
        { label: 'Generated (simple)', value: 'simpleGenerated' },
        { label: 'Generated (complex)', value: 'complexGenerated' },
      ]}
      bind:value={selectedGraphValue}
      menuIcon=""
      dense
      stepper
    />

    <Field label="Settings" labelPlacement="inset" let:id dense>
      <Switch checked={showSettings} on:change={toggle} {id} size="md" />
    </Field>
  </div>

  <Preview data={selectedGraph}>
    <div class="flex gap-2">
      <div class="flex-1 h-[700px] p-4 border rounded-sm overflow-hidden">
        <Chart
          data={[]}
          transform={{
            mode: 'canvas',
            initialScrollMode: 'scale',
            motion: { type: 'tween', duration: 800, easing: cubicOut },
          }}
        >
          <TransformControls />

          <Svg>
            <Dagre data={selectedGraph} edges={(d) => d.links} {...settings.playground}>
              {#snippet children({ nodes, edges })}
                <g class="edges">
                  {#each edges as edge, i (edge.v + '-' + edge.w)}
                    <Spline
                      data={edge.points}
                      x="x"
                      y="y"
                      class="stroke-surface-content opacity-30"
                      motion="tween"
                      curve={settings.playground.curve}
                      markerEnd={settings.playground.arrow}
                    />
                  {/each}
                </g>

                <g class="nodes">
                  {#each nodes as node (node.label)}
                    <Group x={node.x - node.width / 2} y={node.y - node.height / 2} motion="tween">
                      <Rect
                        width={node.width}
                        height={node.height}
                        class="fill-surface-200 stroke-2 stroke-primary/50"
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
              {/snippet}
            </Dagre>
          </Svg>
        </Chart>
      </div>

      {#if showSettings}
        <div transition:slide={{ axis: 'x' }}>
          <DagreControls bind:settings={settings.playground} />
        </div>
      {/if}
    </div>
  </Preview>
</Toggle>

<Toggle let:on={showSettings} let:toggle>
  <div class="grid grid-cols-[1fr_auto] gap-2 items-end">
    <h2>Basic</h2>

    <Field label="Settings" labelPlacement="left" class="mb-1" let:id>
      <Switch checked={showSettings} on:change={toggle} {id} size="md" />
    </Field>
  </div>

  <Preview data={data.basic}>
    <div class="flex gap-2">
      <div class="flex-1 h-[500px] p-4 border rounded-sm overflow-hidden">
        <Chart
          transform={{
            mode: 'canvas',
            initialScrollMode: 'scale',
            motion: { type: 'tween', duration: 800, easing: cubicOut },
          }}
        >
          <TransformControls />

          <Svg>
            <Dagre data={data.basic} edges={(d) => d.links} {...settings.simple}>
              {#snippet children({ nodes, edges })}
                <g class="edges">
                  {#each edges as edge, i (edge.v + '-' + edge.w)}
                    <Spline
                      data={edge.points}
                      x="x"
                      y="y"
                      class="stroke-surface-content opacity-30"
                      motion="tween"
                      curve={settings.simple.curve}
                      markerEnd={settings.simple.arrow}
                    />
                  {/each}
                </g>

                <g class="nodes">
                  {#each nodes as node (node.label)}
                    <Group x={node.x - node.width / 2} y={node.y - node.height / 2} motion="tween">
                      <Rect
                        width={node.width}
                        height={node.height}
                        class="fill-surface-200 stroke-2 stroke-primary/50"
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
              {/snippet}
            </Dagre>
          </Svg>
        </Chart>
      </div>

      {#if showSettings}
        <div transition:slide={{ axis: 'x' }}>
          <DagreControls bind:settings={settings.simple} />
        </div>
      {/if}
    </div>
  </Preview>
</Toggle>

<Toggle let:on={showSettings} let:toggle>
  <div class="grid grid-cols-[1fr_auto] gap-2 items-end">
    <h2>TCP State Diagram</h2>

    <Field label="Settings" labelPlacement="left" class="mb-1" let:id>
      <Switch checked={showSettings} on:change={toggle} {id} size="md" />
    </Field>
  </div>

  <!-- https://dagrejs.github.io/project/dagre-d3/latest/demo/tcp-state-diagram.html -->

  <Preview data={data.tcpState}>
    <div class="flex gap-2">
      <div class="flex-1 h-[700px] p-4 border rounded-sm overflow-hidden">
        <Chart
          transform={{
            mode: 'canvas',
            initialScale: 0.75,
            initialTranslate: { x: 0, y: -110 },
            initialScrollMode: 'scale',
            motion: { type: 'tween', duration: 800, easing: cubicOut },
          }}
        >
          <TransformControls />

          <Svg>
            <Dagre data={data.tcpState} edges={(d) => d.links} {...settings.tcpState}>
              {#snippet children({ nodes, edges })}
                <g class="edges">
                  {#each edges as edge, i (edge.v + '-' + edge.w)}
                    <Spline
                      data={edge.points}
                      x="x"
                      y="y"
                      class="stroke-surface-content opacity-30"
                      motion="tween"
                      curve={settings.tcpState?.curve}
                      markerEnd={settings.tcpState.arrow}
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
                      motion="tween"
                    />
                  {/each}
                </g>

                <g class="nodes">
                  {#each nodes as node (node.label)}
                    <Group x={node.x - node.width / 2} y={node.y - node.height / 2} motion="tween">
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
              {/snippet}
            </Dagre>
          </Svg>
        </Chart>
      </div>

      {#if showSettings}
        <div transition:slide={{ axis: 'x' }}>
          <DagreControls bind:settings={settings.tcpState} />
        </div>
      {/if}
    </div>
  </Preview>
</Toggle>

<Toggle let:on={showSettings} let:toggle>
  <div class="grid grid-cols-[1fr_auto] gap-2 items-end">
    <h2>Software user flow</h2>

    <Field label="Settings" labelPlacement="left" class="mb-1" let:id>
      <Switch checked={showSettings} on:change={toggle} {id} size="md" />
    </Field>
  </div>

  <!-- https://observablehq.com/@mbirk/dagre -->

  <Preview data={data.softwareUserFlow}>
    <div class="flex gap-2">
      <div class="flex-1 h-[700px] p-4 border rounded-sm overflow-hidden">
        <Chart
          transform={{
            mode: 'canvas',
            initialScale: 0.75,
            initialTranslate: { x: 0, y: -110 },
            initialScrollMode: 'scale',
            motion: { type: 'tween', duration: 800, easing: cubicOut },
          }}
        >
          <TransformControls />

          <Svg>
            <Dagre
              data={data.softwareUserFlow}
              edges={(d) => d.links}
              {...settings.softwareUserFlow}
            >
              {#snippet children({ nodes, edges })}
                <g class="edges">
                  {#each edges as edge, i (edge.v + '-' + edge.w)}
                    <Spline
                      data={edge.points}
                      x="x"
                      y="y"
                      class="stroke-surface-content opacity-30"
                      motion="tween"
                      curve={settings.softwareUserFlow?.curve}
                      markerEnd={settings.softwareUserFlow.arrow}
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
                      motion="tween"
                    />
                  {/each}
                </g>

                <g class="nodes">
                  {#each nodes as node (node.label)}
                    <Group x={node.x - node.width / 2} y={node.y - node.height / 2} motion="tween">
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
              {/snippet}
            </Dagre>
          </Svg>
        </Chart>
      </div>

      {#if showSettings}
        <div transition:slide={{ axis: 'x' }}>
          <DagreControls bind:settings={settings.softwareUserFlow} />
        </div>
      {/if}
    </div>
  </Preview>
</Toggle>

<!-- TODO: Match dagre d3 example - https://dagrejs.github.io/project/dagre-d3/latest/demo/clusters.html -->
<!-- <Toggle let:on={showSettings} let:toggle>
  <div class="grid grid-cols-[1fr_auto] gap-2 items-end">
    <h2>Cluster</h2>

    <Field label="Settings" labelPlacement="left" class="mb-1" let:id>
      <Switch checked={showSettings} on:change={toggle} {id} size="md" />
    </Field>
  </div>

  <Preview data={data.cluster}>
    <div class="flex gap-2">
      <div class="flex-1 h-[500px] p-4 border rounded-sm overflow-hidden">
        <Chart
          data={data.cluster}
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
              data={data.cluster}
              edges={(d) => d.links}
              compound
              {...settings.cluster}
              let:nodes
              let:edges
            >
              <g class="edges">
                {#each edges as edge, i (edge.v + '-' + edge.w)}
                  <Spline
                    data={edge.points}
                    x="x"
                    y="y"
                    class="stroke-surface-content opacity-30"
                    tweened
                    curve={settings.cluster?.curve}
                    markerEnd={settings.cluster.arrow}
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
                        'fill-surface-200 stroke-2 stroke-primary/50 group-hover:fill-primary/10 group-hover:cursor-pointer',
                        'fill-none'
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

      {#if showSettings}
        <div transition:slide={{ axis: 'x' }}>
          <DagreControls bind:settings={settings.cluster} />
        </div>
      {/if}
    </div>
  </Preview>
</Toggle> -->
