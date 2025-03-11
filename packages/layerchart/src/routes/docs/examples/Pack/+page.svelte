<script lang="ts">
  import { onMount } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import { hierarchy, type HierarchyCircularNode, type HierarchyNode } from 'd3-hierarchy';
  import { scaleSequential, scaleOrdinal } from 'd3-scale';
  import * as chromatic from 'd3-scale-chromatic';
  import { hsl } from 'd3-color';

  import { Chart, Circle, Group, Pack, Svg, TransformContext, findAncestor } from 'layerchart';
  import { Breadcrumb, Button, Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { format, sortFunc } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;

  const complexHierarchy = hierarchy(data.flare)
    .sum((d) => d.value)
    .sort(sortFunc('value', 'desc')) as HierarchyCircularNode<any>;

  let colorBy = 'parent';

  let padding = 3;
  let selected: HierarchyCircularNode<any>;
  let transformContext: TransformContext;

  $: if (transformContext && selected) {
    const diameter = selected.r * 2;
    transformContext.zoomTo(
      { x: selected.x, y: selected.y },
      { width: diameter, height: diameter }
    );
  }

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

  onMount(() => {
    // Set root initially.  Wait for Tree to mount so layout is set
    selected = complexHierarchy as HierarchyCircularNode<any>; // select root initially
  });
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

<Preview data={complexHierarchy}>
  <Breadcrumb items={selected?.ancestors().reverse() ?? []}>
    <Button slot="item" let:item on:click={() => (selected = item)} base class="px-2 py-1 rounded-sm">
      <div class="text-left">
        <div class="text-sm">{item.data.name}</div>
        <div class="text-xs text-surface-content/50">{format(item.value ?? 0, 'integer')}</div>
      </div>
    </Button>
  </Breadcrumb>
  <div class="h-[600px] p-4 border rounded-sm overflow-hidden">
    <Chart
      data={complexHierarchy}
      transform={{
        mode: 'canvas',
        disablePointer: true,
        tweened: { duration: 800, easing: cubicOut },
      }}
      bind:transformContext
      let:transform
    >
      <Svg on:click={() => (selected = complexHierarchy)}>
        <Pack {padding} let:nodes>
          {#each nodes as node}
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
                strokeWidth={1 / transform.scale}
                fill={nodeColor}
              />
            </Group>
          {/each}
          <!-- Show text on top of all circles -->
          {#each selected ? (selected.children ?? [selected]) : [] as node (node.data.name + node.depth)}
            {@const fontSize = 1 / transform.scale}
            <g in:fade|local>
              <text
                x={node.x}
                y={node.y}
                dy={fontSize * 8}
                class="stroke-white/70 pointer-events-none [text-anchor:middle] [paint-order:stroke]"
                style:font-size="{fontSize}rem"
                style:stroke-width="{fontSize * 2}px"
              >
                {node.data.name}
              </text>
            </g>
          {/each}
        </Pack>
      </Svg>
    </Chart>
  </div>
</Preview>
