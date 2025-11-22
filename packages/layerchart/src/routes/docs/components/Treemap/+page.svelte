<script lang="ts">
  import { hierarchy, type HierarchyNode } from 'd3-hierarchy';
  import { scaleSequential, scaleOrdinal } from 'd3-scale';
  import * as chromatic from 'd3-scale-chromatic';
  import { hsl } from 'd3-color';

  import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { format, sortFunc } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';

  import Preview from '$lib/docs/Preview.svelte';

  import {
    Chart,
    Group,
    Layer,
    Rect,
    RectClipPath,
    Text,
    Tooltip,
    Treemap,
    findAncestor,
  } from 'layerchart';
  import { type ComponentProps } from 'svelte';

  let { data } = $props();

  const root = hierarchy(data.flare)
    .sum((d) => d.value)
    .sort(sortFunc('value', 'desc'));

  const rootPopulation = hierarchy(data.population)
    // @ts-expect-error
    .sum((d) => d.value)
    .sort(sortFunc('value', 'desc'));

  const rootFlat = hierarchy({
    name: 'root',
    children: [
      { name: 'A', value: 1000 },
      { name: 'B', value: 900 },
      { name: 'C', value: 800 },
      { name: 'D', value: 700 },
      { name: 'E', value: 600 },
      { name: 'F', value: 500 },
      { name: 'G', value: 400 },
      { name: 'H', value: 300 },
      { name: 'I', value: 200 },
      { name: 'J', value: 100 },
      { name: 'K', value: 100 },
    ],
  }).sum((d) => {
    // @ts-expect-error
    return d.value;
  });

  let tile: ComponentProps<typeof Treemap>['tile'] = $state('squarify');
  let colorBy = $state('children');
  let maintainAspectRatio = $state(false);

  let paddingOuter = $state(4);
  let paddingInner = $state(4);
  let paddingTop = $state(20);
  let paddingBottom = $state(0);
  let paddingLeft = $state(0);
  let paddingRight = $state(0);

  const sequentialColor = scaleSequential([4, -1], chromatic.interpolateGnBu);
  const ordinalColor = scaleOrdinal(
    chromatic.schemeSpectral[9].filter((c) => hsl(c).h < 60 || hsl(c).h > 90) // filter out hard to see yellow and green
  );

  const simpleOrdinalColor = scaleOrdinal(
    chromatic.schemeSpectral[11].filter((c) => hsl(c).h < 60 || hsl(c).h > 90) // filter out hard to see yellow and green
  );

  function getNodeColor(node: HierarchyNode<any>, colorBy: string) {
    switch (colorBy) {
      case 'children':
        return node.children ? 'var(--color-primary-500)' : 'var(--color-primary-400)';
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

<h1>Example</h1>

<h2>Playground</h2>

<div class="grid gap-1 mb-4">
  <div class="grid grid-cols-[6fr_1fr_3fr] gap-1">
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
    <Field label="Maintain Aspect Ratio">
      <ToggleGroup
        bind:value={maintainAspectRatio}
        variant="outline"
        size="sm"
        inset
        class="w-full"
      >
        <ToggleOption value={false}>No</ToggleOption>
        <ToggleOption value={true}>Yes</ToggleOption>
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

<Preview data={rootPopulation}>
  <div class="aspect-[16/9]">
    <Chart>
      {#snippet children({ context })}
        <Layer>
          <Treemap
            hierarchy={rootPopulation}
            {tile}
            {paddingOuter}
            {paddingInner}
            {paddingTop}
            {paddingBottom}
            {paddingLeft}
            {paddingRight}
            {maintainAspectRatio}
          >
            {#snippet children({ nodes })}
              {#each nodes as node}
                <Group
                  x={node.x0}
                  y={node.y0}
                  onpointermove={(e) => context.tooltip.show(e, node)}
                  onpointerleave={context.tooltip.hide}
                >
                  {@const nodeWidth = node.x1 - node.x0}
                  {@const nodeHeight = node.y1 - node.y0}
                  {@const nodeColor = getNodeColor(node, colorBy)}
                  <Rect
                    width={nodeWidth}
                    height={nodeHeight}
                    stroke={colorBy === 'children'
                      ? 'var(--color-primary-content)'
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
                </Group>
              {/each}
            {/snippet}
          </Treemap>
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>{data.data.name}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="value" value={data.value} format="integer" />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Complex</h2>

<div class="grid gap-1 mb-4">
  <div class="grid grid-cols-[6fr_1fr_3fr] gap-1">
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
    <Field label="Maintain Aspect Ratio">
      <ToggleGroup
        bind:value={maintainAspectRatio}
        variant="outline"
        size="sm"
        inset
        class="w-full"
      >
        <ToggleOption value={false}>No</ToggleOption>
        <ToggleOption value={true}>Yes</ToggleOption>
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

<Preview>
  <div class="h-[800px]">
    <Chart>
      {#snippet children({ context })}
        <Layer>
          <Treemap
            hierarchy={root.copy()}
            {tile}
            {paddingOuter}
            {paddingInner}
            {paddingTop}
            {paddingBottom}
            {paddingLeft}
            {paddingRight}
            {maintainAspectRatio}
          >
            {#snippet children({ nodes })}
              {#each nodes as node}
                <Group
                  x={node.x0}
                  y={node.y0}
                  onpointermove={(e) => context.tooltip.show(e, node)}
                  onpointerleave={context.tooltip.hide}
                >
                  {@const nodeWidth = node.x1 - node.x0}
                  {@const nodeHeight = node.y1 - node.y0}
                  {@const nodeColor = getNodeColor(node, colorBy)}
                  <Rect
                    width={nodeWidth}
                    height={nodeHeight}
                    stroke={colorBy === 'children'
                      ? 'var(--color-primary-content)'
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
                </Group>
              {/each}
            {/snippet}
          </Treemap>
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>{data.data.name}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="value" value={data.value} format="integer" />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Simple / flat</h2>

<Preview data={rootFlat}>
  <div class="h-[400px]">
    <Chart>
      <Layer>
        <Treemap hierarchy={rootFlat}>
          {#snippet children({ nodes })}
            {#each nodes.filter((n) => n.depth > 0) as node}
              <Group x={node.x0} y={node.y0}>
                {@const nodeWidth = node.x1 - node.x0}
                {@const nodeHeight = node.y1 - node.y0}
                <Rect
                  width={nodeWidth}
                  height={nodeHeight}
                  stroke="rgb(0, 0, 0, 0.2)"
                  fill={simpleOrdinalColor(node.data.name)}
                />
                <Text
                  x={nodeWidth / 2}
                  y={nodeHeight / 2}
                  value={node.data.name}
                  fill="rgb(0, 0, 0, 0.8)"
                  textAnchor="middle"
                  verticalAnchor="middle"
                />
              </Group>
            {/each}
          {/snippet}
        </Treemap>
      </Layer>
    </Chart>
  </div>
</Preview>
