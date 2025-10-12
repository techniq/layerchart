<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import { hierarchy, type HierarchyNode } from 'd3-hierarchy';
  import { curveBumpX, curveBumpY, curveStep, curveStepBefore, curveStepAfter } from 'd3-shape';

  import { Chart, Group, Link, Layer, Rect, Text, Tree } from 'layerchart';
  import TransformControls from '$lib/components/TransformControls.svelte';
  import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { cls } from '@layerstack/tailwind';

  import Preview from '$lib/docs/Preview.svelte';
  import type { ConnectorSweep, ConnectorType } from 'layerchart/utils/connectorUtils.js';
  import ConnectorTypeMenuField from 'layerchart/docs/ConnectorTypeMenuField.svelte';
  import ConnectorSweepMenuField from 'layerchart/docs/ConnectorSweepMenuField.svelte';
  import { shared } from '../../shared.svelte.js';

  let { data } = $props();

  let expandedNodeNames = $state(['flare']);

  const complexDataHierarchy = $derived(
    hierarchy(data.flare, (d) => (expandedNodeNames.includes(d.name) ? d.children : null))
  );
  // .sum((d) => d.value)
  // .sort(sortFunc('value', 'desc'));

  let orientation: ComponentProps<typeof Tree>['orientation'] = $state('horizontal');
  let curve = $state(curveBumpX);
  let layout = $state('chart');
  let selected = $state();
  let sweep: ConnectorSweep = $state('none'); // Sweep direction
  let type: ConnectorType = $state('d3'); // Connector type: 'straight', 'square', 'beveled', 'rounded', 'd3'
  let radius = $state(60); // Corner radius (for 'beveled', 'rounded')

  function getNodeKey(node: HierarchyNode<{ name: string }>) {
    return node.data.name + node.depth;
  }

  const nodeWidth = 120;
  const nodeHeight = 20;
  const nodeSiblingGap = 20;
  const nodeParentGap = 100;
  const nodeSize = $derived(
    orientation === 'horizontal'
      ? ([nodeHeight + nodeSiblingGap, nodeWidth + nodeParentGap] as [number, number])
      : ([nodeWidth + nodeSiblingGap, nodeHeight + nodeParentGap] as [number, number])
  );
</script>

<h1>Examples</h1>

<div class="grid gap-1 mb-4">
  <div class="grid grid-cols-2 gap-1">
    <Field label="Orientation">
      <ToggleGroup bind:value={orientation} variant="outline" size="sm" inset class="w-full">
        <ToggleOption value="horizontal">Horizontal</ToggleOption>
        <ToggleOption value="vertical">Vertical</ToggleOption>
      </ToggleGroup>
    </Field>

    <Field label="Layout">
      <ToggleGroup bind:value={layout} variant="outline" size="sm" inset class="w-full">
        <ToggleOption value="chart">Chart</ToggleOption>
        <ToggleOption value="node">Node</ToggleOption>
      </ToggleGroup>
    </Field>
  </div>

  <div class="grid grid-cols-2 gap-1">
    <ConnectorTypeMenuField bind:value={type} />
    <ConnectorSweepMenuField bind:value={sweep} />

    {#if type === 'd3'}
      <Field label="Curve">
        <ToggleGroup
          bind:value={curve}
          variant="outline"
          size="sm"
          inset
          class="w-full"
          classes={{ options: 'whitespace-nowrap' }}
        >
          <ToggleOption value={curveBumpX}>BumpX</ToggleOption>
          <ToggleOption value={curveBumpY}>BumpY</ToggleOption>
          <ToggleOption value={curveStep}>Step</ToggleOption>
          <ToggleOption value={curveStepBefore}>Step Before</ToggleOption>
          <ToggleOption value={curveStepAfter}>Step After</ToggleOption>
        </ToggleGroup>
      </Field>
    {/if}

    {#if type === 'beveled' || type === 'rounded'}
      <RangeField label="Radius" bind:value={radius} min={0} />
    {/if}
  </div>
</div>

<h2>Basic</h2>

<Preview data={complexDataHierarchy}>
  <div class="h-[800px] p-4 border rounded-sm overflow-hidden relative">
    <Chart
      padding={{ top: 24, left: nodeWidth / 2, right: nodeWidth / 2 }}
      transform={{
        mode: 'canvas',
        motion: { type: 'tween', duration: 800, easing: cubicOut },
      }}
    >
      {#snippet children()}
        <TransformControls orientation="horizontal" class="-m-2" />

        <Tree
          hierarchy={complexDataHierarchy}
          {orientation}
          nodeSize={layout === 'node' ? nodeSize : undefined}
        >
          {#snippet children({ nodes, links })}
            <Layer type={shared.layer}>
              {#each links as link (getNodeKey(link.source) + '_' + getNodeKey(link.target))}
                <Link
                  data={link}
                  {orientation}
                  {curve}
                  {type}
                  {sweep}
                  {radius}
                  motion="tween"
                  class="stroke-surface-content opacity-20"
                />
              {/each}

              {#each nodes as node (getNodeKey(node))}
                <Group
                  x={(orientation === 'horizontal' ? node.y : node.x) - nodeWidth / 2}
                  y={(orientation === 'horizontal' ? node.x : node.y) - nodeHeight / 2}
                  motion="tween"
                  onclick={() => {
                    if (expandedNodeNames.includes(node.data.name)) {
                      expandedNodeNames = expandedNodeNames.filter(
                        (name) => name !== node.data.name
                      );
                    } else {
                      expandedNodeNames = [...expandedNodeNames, node.data.name];
                    }
                    selected = node;

                    // transform.zoomTo({
                    //   x: orientation === 'horizontal' ? selected.y : selected.x,
                    //   y: orientation === 'horizontal' ? selected.x : selected.y,
                    // });
                  }}
                  class={cls(node.data.children && 'cursor-pointer')}
                >
                  <Rect
                    width={nodeWidth}
                    height={nodeHeight}
                    class={cls(
                      'fill-surface-100',
                      node.data.children
                        ? 'stroke-primary hover:stroke-2'
                        : 'stroke-secondary [stroke-dasharray:1]'
                    )}
                    rx={10}
                  />
                  <Text
                    value={node.data.name}
                    x={nodeWidth / 2}
                    y={nodeHeight / 2}
                    dy={-2}
                    textAnchor="middle"
                    verticalAnchor="middle"
                    class={cls(
                      'text-xs pointer-events-none',
                      node.data.children ? 'fill-primary' : 'fill-secondary'
                    )}
                  />
                </Group>
              {/each}
            </Layer>
          {/snippet}
        </Tree>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Html nodes</h2>

<Preview data={complexDataHierarchy}>
  <div class="h-[800px] p-4 border rounded-sm overflow-hidden relative">
    <Chart
      padding={{ top: 24, left: nodeWidth / 2, right: nodeWidth / 2 }}
      transform={{
        mode: 'canvas',
        motion: { type: 'tween', duration: 800, easing: cubicOut },
      }}
    >
      {#snippet children()}
        <TransformControls orientation="horizontal" class="-m-2" />

        <Tree
          hierarchy={complexDataHierarchy}
          {orientation}
          nodeSize={layout === 'node' ? nodeSize : undefined}
        >
          {#snippet children({ nodes, links })}
            <Layer type={shared.layer}>
              {#each links as link (getNodeKey(link.source) + '_' + getNodeKey(link.target))}
                <Link
                  data={link}
                  {orientation}
                  {curve}
                  {type}
                  {sweep}
                  {radius}
                  motion="tween"
                  class="stroke-surface-content opacity-20"
                />
              {/each}
            </Layer>

            <Layer type="html">
              {#each nodes as node}
                {@const x = (orientation === 'horizontal' ? node.y : node.x) - nodeWidth / 2}
                {@const y = (orientation === 'horizontal' ? node.x : node.y) - nodeHeight / 2}
                <Group
                  {x}
                  {y}
                  motion="tween"
                  style="width: {nodeWidth}px; height: {nodeHeight}px;"
                  class={cls(
                    'bg-surface-100 rounded-full outline',
                    'text-xs text-center',
                    node.data.children
                      ? 'outline-primary hover:outline-2 text-primary cursor-pointer'
                      : 'outline-secondary text-secondary outline-dashed'
                  )}
                  onclick={() => {
                    if (expandedNodeNames.includes(node.data.name)) {
                      expandedNodeNames = expandedNodeNames.filter(
                        (name) => name !== node.data.name
                      );
                    } else {
                      expandedNodeNames = [...expandedNodeNames, node.data.name];
                    }
                    selected = node;
                  }}
                >
                  {node.data.name}
                </Group>
              {/each}
            </Layer>
          {/snippet}
        </Tree>
      {/snippet}
    </Chart>
  </div>
</Preview>
