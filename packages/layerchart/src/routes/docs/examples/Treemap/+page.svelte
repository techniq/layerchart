<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import { hierarchy, type HierarchyNode, type HierarchyRectangularNode } from 'd3-hierarchy';
  import { scaleSequential, scaleOrdinal } from 'd3-scale';
  import * as chromatic from 'd3-scale-chromatic';
  import { hsl } from 'd3-color';
  import { rollup } from 'd3-array';

  import {
    Button,
    Breadcrumb,
    Field,
    RangeField,
    Switch,
    ToggleGroup,
    ToggleOption,
  } from 'svelte-ux';
  import { format, sortFunc } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';

  import Preview from '$lib/docs/Preview.svelte';

  import {
    Bounds,
    Chart,
    ChartClipPath,
    Group,
    Rect,
    RectClipPath,
    Svg,
    Text,
    Tooltip,
    Treemap,
    findAncestor,
  } from 'layerchart';
  import { isNodeVisible } from '$lib/utils/treemap.js';
  import type { ComponentProps } from 'svelte';

  export let data;

  const complexDataHierarchy = hierarchy(data.flare)
    .sum((d) => d.value)
    .sort(sortFunc('value', 'desc'));

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
  $: groupedHierarchy = hierarchy(groupedCars).count();

  let tile: ComponentProps<Treemap>['tile'] = 'squarify';
  let colorBy = 'children';

  let selectedNested: HierarchyRectangularNode<any> | null = null;
  let selectedZoomable: HierarchyRectangularNode<any> | null = null;
  let selectedCarNode: HierarchyNode<any> | null = groupedHierarchy;
  let paddingOuter = 4;
  let paddingInner = 4;
  let paddingTop = 20;
  let paddingBottom = 0;
  let paddingLeft = 0;
  let paddingRight = 0;

  const sequentialColor = scaleSequential([4, -1], chromatic.interpolateGnBu);
  // filter out hard to see yellow and green
  const ordinalColor = scaleOrdinal(
    chromatic.schemeSpectral[9].filter((c) => hsl(c).h < 60 || hsl(c).h > 90)
  );
  // const ordinalColor = scaleOrdinal(chromatic.schemeCategory10)

  function getNodeColor(node: HierarchyNode<any>, colorBy: string) {
    switch (colorBy) {
      case 'children':
        return node.children ? 'hsl(var(--color-primary-500))' : 'hsl(var(--color-primary-400))';
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

<h1>Examples</h1>

<h2>Nested</h2>

<h3>Zoomable</h3>

<div class="grid gap-1 mb-4">
  <div class="grid grid-cols-[6fr_3fr] gap-1">
    <Field label="Tile">
      <ToggleGroup bind:value={tile} variant="outline" size="sm" inset class="w-full">
        <ToggleOption value="squarify">Squarify</ToggleOption>
        <ToggleOption value="resquarify">Resquarify</ToggleOption>
        <ToggleOption value="binary">Binary</ToggleOption>
        <ToggleOption value="slice">Slice</ToggleOption>
        <ToggleOption value="dice">Dice</ToggleOption>
        <ToggleOption value="sliceDice">Slice / Dice</ToggleOption>
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
  <div class="grid grid-cols-2 gap-2">
    <RangeField label="Padding Outer" bind:value={paddingOuter} />
    <RangeField label="Padding Inner" bind:value={paddingInner} />
  </div>
  <div class="grid grid-cols-4 gap-2">
    <RangeField label="Padding Top" bind:value={paddingTop} />
    <RangeField label="Padding Bottom" bind:value={paddingBottom} />
    <RangeField label="Padding Left" bind:value={paddingLeft} />
    <RangeField label="Padding Right" bind:value={paddingRight} />
  </div>
</div>

<Preview data={complexDataHierarchy.copy()}>
  <Breadcrumb items={selectedNested?.ancestors().reverse() ?? []}>
    <Button
      slot="item"
      let:item
      on:click={() => (selectedNested = item)}
      base
      class="px-2 py-1 rounded"
    >
      <div class="text-left">
        <div class="text-sm">{item.data.name}</div>
        <div class="text-xs text-surface-content/50">{format(item.value ?? 0, 'integer')}</div>
      </div>
    </Button>
  </Breadcrumb>
  <div class="h-[800px] p-4 border rounded">
    <Chart data={complexDataHierarchy.copy()} let:tooltip>
      <Svg>
        <Bounds
          domain={selectedNested}
          tweened={{ duration: 800, easing: cubicOut }}
          let:xScale
          let:yScale
        >
          <ChartClipPath>
            <Treemap
              let:nodes
              {tile}
              bind:selected={selectedNested}
              {paddingOuter}
              {paddingInner}
              {paddingTop}
              {paddingBottom}
              {paddingLeft}
              {paddingRight}
            >
              {#each nodes as node}
                <Group
                  x={xScale(node.x0)}
                  y={yScale(node.y0)}
                  onclick={() => (node.children ? (selectedNested = node) : null)}
                  onpointermove={(e) => tooltip.show(e, node)}
                  onpointerleave={tooltip.hide}
                >
                  {@const nodeWidth = xScale(node.x1) - xScale(node.x0)}
                  {@const nodeHeight = yScale(node.y1) - yScale(node.y0)}
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
                      fillOpacity={node.children ? 0.5 : 1}
                      rx={5}
                    />
                    <RectClipPath width={nodeWidth} height={nodeHeight}>
                      <text
                        x={4}
                        y={16 * 0.6 + 4}
                        class={cls(
                          'text-[10px] font-medium',
                          colorBy === 'children' ? 'fill-primary-content' : 'fill-black'
                        )}
                      >
                        <tspan>{node.data.name}</tspan>
                        {#if node.children}
                          <tspan class="text-[8px] font-extralight">
                            {format(node.value ?? 0, 'integer')}
                          </tspan>
                        {/if}
                      </text>
                      {#if !node.children}
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
                      {/if}
                    </RectClipPath>
                  </g>
                </Group>
              {/each}
            </Treemap>
          </ChartClipPath>
        </Bounds>
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{data.data.name}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={data.value} format="integer" />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Nested</h2>

<h3>Grouped and Filterable</h3>

<div class="grid gap-1 mb-4">
  <div class="grid grid-cols-[6fr_3fr] gap-1">
    <Field label="Tile">
      <ToggleGroup bind:value={tile} variant="outline" size="sm" inset class="w-full">
        <ToggleOption value="squarify">Squarify</ToggleOption>
        <ToggleOption value="resquarify">Resquarify</ToggleOption>
        <ToggleOption value="binary">Binary</ToggleOption>
        <ToggleOption value="slice">Slice</ToggleOption>
        <ToggleOption value="dice">Dice</ToggleOption>
        <ToggleOption value="sliceDice">Slice / Dice</ToggleOption>
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
  <div class="grid grid-cols-2 gap-2">
    <RangeField label="Padding Outer" bind:value={paddingOuter} />
    <RangeField label="Padding Inner" bind:value={paddingInner} />
  </div>
  <div class="grid grid-cols-4 gap-2">
    <RangeField label="Padding Top" bind:value={paddingTop} />
    <RangeField label="Padding Bottom" bind:value={paddingBottom} />
    <RangeField label="Padding Left" bind:value={paddingLeft} />
    <RangeField label="Padding Right" bind:value={paddingRight} />
  </div>
  <div class="grid grid-cols-4 gap-2">
    <Field label="Apply Partial Filter" let:id>
      <Switch {id} bind:checked={isFiltered} />
    </Field>
  </div>
</div>

<Preview data={groupedHierarchy}>
  <Breadcrumb items={(selectedCarNode ?? groupedHierarchy).ancestors().reverse()}>
    <Button
      slot="item"
      let:item
      on:click={() => (selectedCarNode = item)}
      base
      class="px-2 py-1 rounded"
    >
      <div class="text-left">
        <div class="text-sm">{item.data[0] ?? 'Overall'}</div>
        <div class="text-xs text-surface-content/50">{format(item.value ?? 0, 'integer')}</div>
      </div>
    </Button>
  </Breadcrumb>
  <div class="h-[800px] p-4 border rounded">
    <Chart data={groupedHierarchy}>
      <Svg>
        <Treemap
          let:nodes
          {tile}
          {paddingOuter}
          {paddingInner}
          {paddingTop}
          {paddingBottom}
          {paddingLeft}
          {paddingRight}
        >
          {#each nodes as node (node
            .ancestors()
            .map((n) => n.data[0])
            .join('_'))}
            <Group
              x={node.x0}
              y={node.y0}
              onclick={() => {
                console.log('click');
                node.children ? (selectedCarNode = node) : null;
              }}
              tweened={{ delay: 600 }}
            >
              {@const nodeWidth = node.x1 - node.x0}
              {@const nodeHeight = node.y1 - node.y0}
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
                  fillOpacity={node.children ? 0.5 : 1}
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
                      <tspan class="text-[8px] font-extralight"
                        >{format(node.value ?? 0, 'integer')}</tspan
                      >
                    {/if}
                  </text>
                  {#if !node.children}
                    <!-- <Text
												value={format(node.value ?? 0, 'integer')}
                        class="text-[8px] font-extralight"
												verticalAnchor="start"
												x={4}
												y={16}
											/> -->
                  {/if}
                </RectClipPath>
              </g>
            </Group>
          {/each}
        </Treemap>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Stacked</h2>

<h3>Zoomable</h3>

<div class="grid grid-flow-col gap-4 mb-4">
  <div class="grid grid-cols-[6fr_3fr] gap-2">
    <Field label="Tile">
      <ToggleGroup bind:value={tile} variant="outline" size="sm" inset class="w-full">
        <ToggleOption value="squarify">Squarify</ToggleOption>
        <ToggleOption value="resquarify">Resquarify</ToggleOption>
        <ToggleOption value="binary">Binary</ToggleOption>
        <ToggleOption value="slice">Slice</ToggleOption>
        <ToggleOption value="dice">Dice</ToggleOption>
        <ToggleOption value="sliceDice">Slice / Dice</ToggleOption>
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

<Preview data={complexDataHierarchy.copy()}>
  <Breadcrumb items={selectedZoomable?.ancestors().reverse() ?? []}>
    <Button
      slot="item"
      let:item
      on:click={() => (selectedZoomable = item)}
      base
      class="px-2 py-1 rounded"
    >
      <div class="text-left">
        <div class="text-sm">{item.data.name}</div>
        <div class="text-xs text-surface-content/50">{format(item.value ?? 0, 'integer')}</div>
      </div>
    </Button>
  </Breadcrumb>
  <div class="h-[600px] p-4 border rounded">
    <Chart data={complexDataHierarchy.copy()}>
      <Svg>
        <Bounds
          domain={selectedZoomable}
          tweened={{ duration: 800, easing: cubicOut }}
          let:xScale
          let:yScale
        >
          <ChartClipPath>
            <Treemap let:nodes {tile} bind:selected={selectedZoomable}>
              {#each nodes as node}
                <Group
                  x={xScale(node.x0)}
                  y={yScale(node.y0)}
                  onclick={() => (node.children ? (selectedZoomable = node) : null)}
                >
                  {@const nodeWidth = xScale(node.x1) - xScale(node.x0)}
                  {@const nodeHeight = yScale(node.y1) - yScale(node.y0)}
                  <RectClipPath width={nodeWidth} height={nodeHeight}>
                    {@const nodeColor = getNodeColor(node, colorBy)}
                    {#if isNodeVisible(node, selectedZoomable)}
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
                          value="{node.data.name} ({node.children?.length ?? 0})"
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
                    {/if}
                  </RectClipPath>
                </Group>
              {/each}
            </Treemap>
          </ChartClipPath>
        </Bounds>
      </Svg>
    </Chart>
  </div>
</Preview>
