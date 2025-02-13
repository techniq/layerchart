<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { hierarchy, type HierarchyNode } from 'd3-hierarchy';
  import { curveBumpX, curveBumpY, curveStep, curveStepBefore, curveStepAfter } from 'd3-shape';

  import { Canvas, Chart, Group, Html, Link, Rect, Svg, Text, Tree } from 'layerchart';
  import TransformControls from '$lib/components/TransformControls.svelte';
  import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { cls } from '@layerstack/tailwind';

  import Preview from '$lib/docs/Preview.svelte';
  import type { Component, ComponentProps } from 'svelte';

  export let data;

  let expandedNodeNames = ['flare'];

  $: complexDataHierarchy = hierarchy(data.flare, (d) =>
    expandedNodeNames.includes(d.name) ? d.children : null
  );
  // .sum((d) => d.value)
  // .sort(sortFunc('value', 'desc'));

  let orientation: ComponentProps<Tree>['orientation'] = 'horizontal';
  let curve = curveBumpX;
  let layout = 'chart';
  let Context: Component = Svg;
  let selected;

  function getNodeKey(node: HierarchyNode<{ name: string }>) {
    return node.data.name + node.depth;
  }

  const nodeWidth = 120;
  const nodeHeight = 20;
  const nodeSiblingGap = 20;
  const nodeParentGap = 100;
  $: nodeSize =
    orientation === 'horizontal'
      ? ([nodeHeight + nodeSiblingGap, nodeWidth + nodeParentGap] as [number, number])
      : ([nodeWidth + nodeSiblingGap, nodeHeight + nodeParentGap] as [number, number]);
</script>

<h1>Examples</h1>

<div class="grid gap-1 mb-4">
  <div class="grid grid-cols-[1fr_2fr_1fr] gap-1">
    <Field label="Orientation">
      <ToggleGroup bind:value={orientation} variant="outline" size="sm" inset class="w-full">
        <ToggleOption value="horizontal">Horizontal</ToggleOption>
        <ToggleOption value="vertical">Vertical</ToggleOption>
      </ToggleGroup>
    </Field>

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

    <Field label="Layout">
      <ToggleGroup bind:value={layout} variant="outline" size="sm" inset class="w-full">
        <ToggleOption value="chart">Chart</ToggleOption>
        <ToggleOption value="node">Node</ToggleOption>
      </ToggleGroup>
    </Field>

    <!-- <Field label="Context">
      <ToggleGroup bind:value={Context} variant="outline" size="sm" inset class="w-full">
        <ToggleOption value={Svg}>Svg</ToggleOption>
        <ToggleOption value={Canvas}>Canvas</ToggleOption>
      </ToggleGroup>
    </Field> -->
  </div>
</div>

<h2>Basic</h2>

<Preview data={complexDataHierarchy}>
  <div class="h-[800px] p-4 border rounded overflow-hidden relative">
    <Chart
      data={complexDataHierarchy}
      padding={{ top: 24, left: nodeWidth / 2, right: nodeWidth / 2 }}
      transform={{
        mode: 'canvas',
        tweened: { duration: 800, easing: cubicOut },
      }}
      let:transform
    >
      <TransformControls orientation="horizontal" class="-m-2" />

      <Tree let:nodes let:links {orientation} nodeSize={layout === 'node' ? nodeSize : undefined}>
        <svelte:component this={Context}>
          {#each links as link (getNodeKey(link.source) + '_' + getNodeKey(link.target))}
            <Link
              data={link}
              {orientation}
              {curve}
              tweened
              class="stroke-surface-content opacity-20"
            />
          {/each}

          {#each nodes as node (getNodeKey(node))}
            <Group
              x={(orientation === 'horizontal' ? node.y : node.x) - nodeWidth / 2}
              y={(orientation === 'horizontal' ? node.x : node.y) - nodeHeight / 2}
              tweened
              onclick={() => {
                if (expandedNodeNames.includes(node.data.name)) {
                  expandedNodeNames = expandedNodeNames.filter((name) => name !== node.data.name);
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
        </svelte:component>
      </Tree>
    </Chart>
  </div>
</Preview>

<h2>Html nodes</h2>

<Preview data={complexDataHierarchy}>
  <div class="h-[800px] p-4 border rounded overflow-hidden relative">
    <Chart
      data={complexDataHierarchy}
      padding={{ top: 24, left: nodeWidth / 2, right: nodeWidth / 2 }}
      transform={{
        mode: 'canvas',
        tweened: { duration: 800, easing: cubicOut },
      }}
      let:transform
    >
      <TransformControls orientation="horizontal" class="-m-2" />

      <Tree let:nodes let:links {orientation} nodeSize={layout === 'node' ? nodeSize : undefined}>
        <svelte:component this={Context}>
          {#each links as link (getNodeKey(link.source) + '_' + getNodeKey(link.target))}
            <Link
              data={link}
              {orientation}
              {curve}
              tweened
              class="stroke-surface-content opacity-20"
            />
          {/each}
        </svelte:component>

        <Html>
          {#each nodes as node (getNodeKey(node))}
            {@const x = (orientation === 'horizontal' ? node.y : node.x) - nodeWidth / 2}
            {@const y = (orientation === 'horizontal' ? node.x : node.y) - nodeHeight / 2}
            <Group
              {x}
              {y}
              tweened
              style="width: {nodeWidth}px; height: {nodeHeight}px;"
              class={cls(
                'bg-surface-100 rounded-full outline outline-1',
                'text-xs text-center',
                node.data.children
                  ? 'outline-primary hover:outline-2 text-primary cursor-pointer'
                  : 'outline-secondary text-secondary outline-dashed'
              )}
              onclick={() => {
                if (expandedNodeNames.includes(node.data.name)) {
                  expandedNodeNames = expandedNodeNames.filter((name) => name !== node.data.name);
                } else {
                  expandedNodeNames = [...expandedNodeNames, node.data.name];
                }
                selected = node;
              }}
            >
              {node.data.name}
            </Group>
          {/each}
        </Html>
      </Tree>
    </Chart>
  </div>
</Preview>
