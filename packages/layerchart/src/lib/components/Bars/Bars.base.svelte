<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { BarsProps } from './Bars.shared.svelte.js';

  export type BarsBaseLayerComponents = {
    Bar: Component<any>;
    Group: Component<any>;
  };

  export type BarsBaseProps = BarsProps & BarsBaseLayerComponents;
</script>

<script lang="ts">
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { BarsState } from './Bars.shared.svelte.js';

  let {
    Bar,
    Group,
    fill,
    key = (_, i) => i,
    data: dataProp,
    onBarClick = () => {},
    children,
    radius = 0,
    strokeWidth = 0,
    stroke = 'black',
    seriesKey,
    stackPadding = 0,
    ...restProps
  }: BarsBaseProps = $props();

  const c = new BarsState(
    () =>
      ({
        data: dataProp,
        key,
        onBarClick,
        seriesKey,
        stackPadding,
        fill,
        radius,
        strokeWidth,
        stroke,
      }) as BarsProps
  );
</script>

<Group class="lc-bars">
  {#if children}
    {@render children()}
  {:else}
    {#each c.data as d, i (key(d, i))}
      <Bar
        data={d}
        {radius}
        {strokeWidth}
        {stroke}
        {seriesKey}
        {stackPadding}
        fill={fill ?? c.series?.color ?? (c.ctx.config.c ? c.ctx.cGet(d) : null)}
        onclick={(e: MouseEvent) => onBarClick(e, { data: d })}
        {...extractLayerProps(restProps, 'lc-bars-bar')}
      />
    {/each}
  {/if}
</Group>
