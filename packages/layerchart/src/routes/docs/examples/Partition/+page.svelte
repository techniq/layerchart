<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import { hierarchy, type HierarchyNode, type HierarchyRectangularNode } from 'd3-hierarchy';
  import { scaleSequential, scaleOrdinal } from 'd3-scale';
  import * as chromatic from 'd3-scale-chromatic';
  import { hsl } from 'd3-color';
  import { rollup } from 'd3-array';

  import {
    Bounds,
    Chart,
    ChartClipPath,
    Group,
    Partition,
    Rect,
    RectClipPath,
    Svg,
    Text,
    findAncestor,
  } from 'layerchart';

  import {
    Breadcrumb,
    Button,
    Field,
    RangeField,
    Switch,
    ToggleGroup,
    ToggleOption,
  } from 'svelte-ux';
  import { format, sortFunc } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;

  const complexHierarchy = hierarchy(data.flare)
    .sum((d) => d.value)
    .sort(sortFunc('value', 'desc')) as HierarchyRectangularNode<any>;

  const horizontalHierarchy = complexHierarchy.copy();
  const verticalHierarchy = complexHierarchy.copy();

  let isFiltered = false;
  $: groupedCars = rollup(
    data.cars
      // Limit dataset
      .filter((d) =>
        ['BMW', 'Chevrolet', 'Dodge', 'Ford', 'Honda', 'Toyota', 'Volkswagen'].includes(d.make)
      )
      // Hide some models in each group to show transitions
      .filter((d) => (isFiltered ? d.year > 2010 : true))
      // Apply `make` selection
      .filter((d) => {
        if (selectedCarNode?.depth === 1) {
          return d.make === selectedCarNode.data[0];
        } else {
          return true;
        }
      }),
    (items) => items[0], //.slice(0, 3),
    (d) => d.make,
    (d) => d.model
    // d => d.year,
  );
  let groupedHierarchy: HierarchyRectangularNode<any>;
  $: groupedHierarchy = hierarchy(groupedCars).count() as HierarchyRectangularNode<any>;

  let colorBy = 'children';

  let padding = 0;
  let round = false;
  let fullSizeLeafNodes = false;
  let selectedHorizontal = horizontalHierarchy; // select root initially
  let selectedVertical = verticalHierarchy; // select root initially
  let selectedCarNode = groupedHierarchy;

  const sequentialColor = scaleSequential([4, -1], chromatic.interpolateGnBu);
  // filter out hard to see yellow and green
  const ordinalColor = scaleOrdinal(
    chromatic.schemeSpectral[9].filter((c) => hsl(c).h < 60 || hsl(c).h > 90)
  );
  // const ordinalColor = scaleOrdinal(chromatic.schemeCategory10)

  function getNodeColor(node: HierarchyNode<any>, colorBy: string) {
    switch (colorBy) {
      case 'children':
        return node.children ? 'hsl(var(--color-primary))' : 'hsl(var(--color-primary-600))';
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
</script>

<div class="grid grid-flow-col gap-4 mb-4">
  <div class="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2">
    <RangeField label="Padding" bind:value={padding} max={20} />
    <Field label="Full-size Leaf Nodes">
      <ToggleGroup bind:value={fullSizeLeafNodes} variant="outline" size="sm" inset class="w-full">
        <ToggleOption value={true}>Yes</ToggleOption>
        <ToggleOption value={false}>No</ToggleOption>
      </ToggleGroup>
    </Field>
    <Field label="Round">
      <ToggleGroup bind:value={round} variant="outline" size="sm" inset class="w-full">
        <ToggleOption value={true}>Yes</ToggleOption>
        <ToggleOption value={false}>No</ToggleOption>
      </ToggleGroup>
    </Field>
    <Field label="Color By">
      <ToggleGroup bind:value={colorBy} variant="outline" size="sm" inset class="w-full">
        <ToggleOption value="children">Children</ToggleOption>
        <ToggleOption value="depth">Depth</ToggleOption>
        <ToggleOption value="parent">Parent</ToggleOption>
      </ToggleGroup>
    </Field>
  </div>
</div>

<h1>Examples</h1>

<h2>Horizontal</h2>

<Preview data={horizontalHierarchy}>
  <Breadcrumb items={selectedHorizontal?.ancestors().reverse() ?? []}>
    <Button
      slot="item"
      let:item
      on:click={() => (selectedHorizontal = item)}
      base
      class="px-2 py-1 rounded-sm"
    >
      <div class="text-left">
        <div class="text-sm">{item.data.name}</div>
        <div class="text-xs text-surface-content/50">{format(item.value ?? 0, 'integer')}</div>
      </div>
    </Button>
  </Breadcrumb>
  <div class="h-[600px] p-4 border rounded-sm">
    <Chart data={horizontalHierarchy} let:width>
      <Svg>
        <Bounds
          let:xScale
          let:yScale
          domain={{
            x0: selectedHorizontal?.y0,
            y0: selectedHorizontal?.x0,
            y1: selectedHorizontal?.x1,
          }}
          tweened={{ duration: 800, easing: cubicOut }}
        >
          <ChartClipPath>
            <Partition {padding} {round} let:nodes>
              {#each nodes as node}
                {@const nodeWidth =
                  node.children || !fullSizeLeafNodes
                    ? xScale(node.y1) - xScale(node.y0)
                    : width - xScale(node.y0)}
                {@const nodeHeight = yScale(node.x1) - yScale(node.x0)}
                <Group
                  x={xScale(node.y0)}
                  y={yScale(node.x0)}
                  onclick={() => (selectedHorizontal = node)}
                >
                  <RectClipPath width={nodeWidth} height={nodeHeight}>
                    {@const nodeColor = getNodeColor(node, colorBy)}
                    <g transition:fade={{ duration: 600 }}>
                      <Rect
                        width={nodeWidth}
                        height={nodeHeight}
                        stroke={colorBy === 'children'
                          ? 'hsl(var(--color-primary-content))'
                          : hsl(nodeColor).darker(1).toString()}
                        stroke-opacity={colorBy === 'children' ? 0.2 : 1}
                        fill={nodeColor}
                        rx={5}
                      />
                      <text
                        x={4}
                        y={16 * 0.6 + 4}
                        class={cls(
                          'text-[10px] font-medium',
                          colorBy === 'children' ? 'fill-primary-content' : 'fill-black'
                        )}
                      >
                        <tspan>{node.data.name}</tspan>
                        <tspan
                          class={cls(
                            'text-[8px] font-extralight',
                            colorBy === 'children' ? 'fill-primary-content' : 'fill-black'
                          )}
                        >
                          {format(node.value ?? 0, 'integer')}
                        </tspan>
                      </text>
                    </g>
                  </RectClipPath>
                </Group>
              {/each}
            </Partition>
          </ChartClipPath>
        </Bounds>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Vertical</h2>

<Preview data={verticalHierarchy}>
  <Breadcrumb items={selectedVertical?.ancestors().reverse() ?? []}>
    <Button
      slot="item"
      let:item
      on:click={() => (selectedVertical = item)}
      base
      class="px-2 py-1 rounded-sm"
    >
      <div class="text-left">
        <div class="text-sm">{item.data.name}</div>
        <div class="text-xs text-surface-content/50">{format(item.value ?? 0, 'integer')}</div>
      </div>
    </Button>
  </Breadcrumb>
  <div class="h-[600px] p-4 border rounded-sm">
    <Chart data={verticalHierarchy} let:height>
      <Svg>
        <Bounds
          let:xScale
          let:yScale
          domain={{ x0: selectedVertical?.x0, y0: selectedVertical?.y0, x1: selectedVertical?.x1 }}
          tweened={{ duration: 800, easing: cubicOut }}
        >
          <ChartClipPath>
            <Partition orientation="vertical" {padding} {round} let:nodes>
              {#each nodes as node}
                {@const nodeWidth = xScale(node.x1) - xScale(node.x0)}
                {@const nodeHeight =
                  node.children || !fullSizeLeafNodes
                    ? yScale(node.y1) - yScale(node.y0)
                    : height - yScale(node.y0)}
                <Group
                  x={xScale(node.x0)}
                  y={yScale(node.y0)}
                  onclick={() => (selectedVertical = node)}
                >
                  <RectClipPath width={nodeWidth} height={nodeHeight}>
                    {@const nodeColor = getNodeColor(node, colorBy)}
                    <g transition:fade={{ duration: 600 }}>
                      <Rect
                        width={nodeWidth}
                        height={nodeHeight}
                        stroke={colorBy === 'children'
                          ? 'hsl(var(--color-primary-content))'
                          : hsl(nodeColor).darker(1).toString()}
                        stroke-opacity={colorBy === 'children' ? 0.2 : 1}
                        fill={nodeColor}
                        rx={5}
                      />
                      <Text
                        value={node.data.name}
                        class={cls(
                          'text-[10px] font-medium',
                          colorBy === 'children' ? 'fill-primary-content' : 'fill-black'
                        )}
                        verticalAnchor="start"
                        x={4}
                        y={2}
                      />
                      <Text
                        value={format(node.value ?? 0, 'integer')}
                        class={cls(
                          'text-[8px] font-extralight',
                          colorBy === 'children' ? 'fill-primary-content' : 'fill-black'
                        )}
                        verticalAnchor="start"
                        x={4}
                        y={16}
                      />
                    </g>
                  </RectClipPath>
                </Group>
              {/each}
            </Partition>
          </ChartClipPath>
        </Bounds>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Filterable</h2>

<div class="grid gap-1 mb-4">
  <div class="grid grid-cols-4 gap-2">
    <Field label="Apply Partial Filter" let:id>
      <Switch {id} bind:checked={isFiltered} />
    </Field>
  </div>
</div>

<Preview data={groupedHierarchy}>
  <Breadcrumb items={selectedCarNode?.ancestors().reverse() ?? []}>
    <Button
      slot="item"
      let:item
      on:click={() => (selectedCarNode = item)}
      base
      class="px-2 py-1 rounded-sm"
    >
      <div class="text-left">
        <div class="text-sm">{item.data[0] ?? 'Overall'}</div>
        <div class="text-xs text-surface-content/50">{format(item.value ?? 0, 'integer')}</div>
      </div>
    </Button>
  </Breadcrumb>
  <div class="h-[600px] p-4 border rounded-sm">
    <Chart data={groupedHierarchy}>
      <Svg>
        <Bounds
          let:xScale
          let:yScale
          domain={{ x0: selectedCarNode?.y0, y0: selectedCarNode?.x0, y1: selectedCarNode?.x1 }}
        >
          <ChartClipPath>
            <Partition {padding} {round} let:nodes>
              {#each nodes as node (node
                .ancestors()
                .map((n) => n.data[0])
                .join('_'))}
                <Group
                  x={xScale(node.y0)}
                  y={yScale(node.x0)}
                  onclick={() => (selectedCarNode = node)}
                  tweened={{ delay: 600 }}
                >
                  {@const nodeWidth = xScale(node.y1) - xScale(node.y0)}
                  {@const nodeHeight = yScale(node.x1) - yScale(node.x0)}
                  {@const nodeColor = getNodeColor(node, colorBy)}
                  <g in:fade={{ duration: 600, delay: 1200 }} out:fade={{ duration: 600 }}>
                    <Rect
                      width={nodeWidth}
                      height={nodeHeight}
                      stroke={colorBy === 'children'
                        ? 'hsl(var(--color-primary-content))'
                        : hsl(nodeColor).darker(1).toString()}
                      stroke-opacity={colorBy === 'children' ? 0.2 : 1}
                      fill={nodeColor}
                      rx={5}
                      tweened={{ delay: 600 }}
                    />
                    <RectClipPath width={nodeWidth} height={nodeHeight} tweened={{ delay: 600 }}>
                      <text
                        x={4}
                        y={16 * 0.6 + 4}
                        class={cls(
                          'text-[10px] font-medium',
                          colorBy === 'children' ? 'fill-primary-content' : 'fill-black'
                        )}
                      >
                        <tspan>{node.data[0] ?? 'Overall'}</tspan>
                        {#if node.children}
                          <tspan
                            class={cls(
                              'text-[8px] font-extralight',
                              colorBy === 'children' ? 'fill-primary-content' : 'fill-black'
                            )}
                          >
                            {format(node.value ?? 0, 'integer')}
                          </tspan>
                        {/if}
                      </text>
                    </RectClipPath>
                  </g>
                </Group>
              {/each}
            </Partition>
          </ChartClipPath>
        </Bounds>
      </Svg>
    </Chart>
  </div>
</Preview>
