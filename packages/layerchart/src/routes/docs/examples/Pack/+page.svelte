<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import { hierarchy, type HierarchyCircularNode, type HierarchyNode } from 'd3-hierarchy';
  import { scaleSequential, scaleOrdinal } from 'd3-scale';
  import * as chromatic from 'd3-scale-chromatic';
  import { hsl } from 'd3-color';

  import {
    Chart,
    Circle,
    Group,
    Pack,
    Layer,
    Text,
    findAncestor,
    type ChartContextValue,
  } from 'layerchart';
  import { Breadcrumb, Button, Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { format, sortFunc } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';
  import { shared } from '../../shared.svelte.js';

  let { data } = $props();
  let renderContext = $derived(shared.renderContext as 'svg' | 'canvas');

  const complexHierarchy = hierarchy(data.flare)
    .sum((d) => d.value)
    .sort(sortFunc('value', 'desc')) as HierarchyCircularNode<any>;

  let colorBy = $state('parent');

  let padding = $state(3);
  let nodes = $state.raw<HierarchyCircularNode<any>[]>([]);
  let selected = $state.raw<HierarchyCircularNode<any>>();
  let context = $state<ChartContextValue>(null!);

  $effect(() => {
    if (context?.transform && selected) {
      const node = findSelectedNodeInHierarchy(selected, nodes);
      const diameter = node.r * 2;
      context.transform.zoomTo({ x: node.x, y: node.y }, { width: diameter, height: diameter });
    }
  });

  const sequentialColor = scaleSequential([4, -1], chromatic.interpolateGnBu);
  // filter out hard to see yellow and green
  const ordinalColor = scaleOrdinal(
    chromatic.schemeSpectral[9].filter((c) => hsl(c).h < 60 || hsl(c).h > 90)
  );
  // const ordinalColor = scaleOrdinal(chromatic.schemeCategory10)

  function getNodeColor(node: HierarchyNode<any>, colorBy: string) {
    switch (colorBy) {
      case 'children':
        return node.children ? '#ccc' : '#ddd';
      case 'depth':
        return sequentialColor(node.depth).toString();
      case 'parent':
        const colorParent = findAncestor(node, (n) => n.depth === 1);
        return colorParent
          ? hsl(ordinalColor(colorParent.data.name))
              .brighter(node.depth * 0.3)
              .toString()
          : '#ddd';
    }
    return '';
  }

  function findSelectedNodeInHierarchy(
    selectedNode: HierarchyCircularNode<any>,
    hierarchy: HierarchyCircularNode<any>[]
  ): HierarchyCircularNode<any> {
    for (const node of hierarchy) {
      if (node.data.name === selectedNode.data.name) {
        return node;
      }
    }
    return selectedNode;
  }
</script>

<div class="grid grid-flow-col gap-4 mb-4">
  <div class="grid grid-cols-[2fr_1fr] gap-2">
    <RangeField label="Padding" bind:value={padding} max={50} />
    <Field label="Color By">
      <ToggleGroup bind:value={colorBy} variant="outline" size="sm" inset class="w-full">
        <ToggleOption value="parent">Parent</ToggleOption>
        <ToggleOption value="depth">Depth</ToggleOption>
      </ToggleGroup>
    </Field>
  </div>
</div>

<h1>Examples</h1>

<h2>General</h2>

<Preview data={complexHierarchy.data}>
  <Breadcrumb
    items={selected ? selected?.ancestors().reverse() : (nodes[0]?.ancestors().reverse() ?? [])}
  >
    <Button
      slot="item"
      let:item
      on:click={() => (selected = item)}
      base
      class="px-2 py-1 rounded-sm"
    >
      <div class="text-left">
        <div class="text-sm">{item.data.name}</div>
        <div class="text-xs text-surface-content/50">{format(item.value ?? 0, 'integer')}</div>
      </div>
    </Button>
  </Breadcrumb>
  <div class="h-[600px] p-4 border rounded-sm overflow-hidden">
    <Chart
      transform={{
        mode: 'canvas',
        disablePointer: true,
        motion: { type: 'tween', duration: 800, easing: cubicOut },
      }}
      bind:context
    >
      <Layer type={renderContext} onclick={() => (selected = complexHierarchy)}>
        <Pack {padding} hierarchy={complexHierarchy} bind:nodes>
          {#each nodes as node ([node.data.name, node.parent?.data.name].join('-'))}
            <Group
              x={node.x}
              y={node.y}
              onclick={(e) => {
                e.stopPropagation();
                selected = node;
              }}
              class="cursor-pointer hover:contrast-[1.2]"
            >
              {@const nodeColor = getNodeColor(node, colorBy)}
              <Circle
                r={node.r}
                stroke={hsl(nodeColor)
                  .darker(colorBy === 'children' ? 0.5 : 1)
                  .toString()}
                strokeWidth={1 / context.transform.scale}
                fill={nodeColor}
              />
            </Group>
          {/each}

          {@const selectedNodes = selected
            ? (selected.children ?? [selected])
            : nodes[0]
              ? (nodes[0].children ?? [nodes[0]])
              : []}

          {#each selectedNodes as node ([node.data.name, node.parent?.data.name].join('-'))}
            {@const trueNode = findSelectedNodeInHierarchy(node, nodes)}
            {@const fontSize = 1 / context.transform.scale}
            <g in:fade|local>
              <Text
                value={trueNode.data.name}
                x={trueNode.x}
                y={trueNode.y}
                dy={fontSize * 8}
                style="font-size: {fontSize}rem; stroke-width: {fontSize * 2}px"
                class="fill-black stroke-white/70 pointer-events-none [text-anchor:middle] [paint-order:stroke]"
              />
            </g>
          {/each}
        </Pack>
      </Layer>
    </Chart>
  </div>
</Preview>
