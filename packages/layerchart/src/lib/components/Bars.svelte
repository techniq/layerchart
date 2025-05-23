<script lang="ts" module>
  export type BarsPropsWithoutHTML = {
    /**
     * Override the data from the context.
     */
    data?: any;

    /**
     * Define unique value for {#each} `(key)` expressions
     * to improve transitions.
     *
     * @default (d, index) => index
     */
    key?: (d: any, index: number) => any;

    /**
     * Event dispatched when an individual bar is clicked.
     */
    onBarClick?: (e: MouseEvent, detail: { data: any }) => void;

    children?: Snippet;
    // TODO: investigate
    [key: string]: any;
  } & Omit<BarPropsWithoutHTML, 'data' | 'children'>;

  export type BarsProps = BarsPropsWithoutHTML & Omit<BarProps, 'data'>;
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';

  import Bar, { type BarProps, type BarPropsWithoutHTML } from './Bar.svelte';
  import Group from './Group.svelte';

  import { chartDataArray } from '../utils/common.js';
  import { getChartContext } from './Chart.svelte';
  import { extractLayerProps, layerClass } from '$lib/utils/attributes.js';

  let {
    fill,
    key = (_, i) => i,
    data: dataProp,
    onBarClick = () => {},
    children,
    radius = 0,
    strokeWidth = 0,
    stroke = 'black',
    ...restProps
  }: BarsProps = $props();

  const ctx = getChartContext();
  const data = $derived(chartDataArray(dataProp ?? ctx.data));
</script>

<Group class={layerClass('bars')}>
  {#if children}
    {@render children()}
  {:else}
    {#each data as d, i (key(d, i))}
      <Bar
        data={d}
        {radius}
        {strokeWidth}
        {stroke}
        fill={fill ?? (ctx.config.c ? ctx.cGet(d) : null)}
        onclick={(e) => onBarClick(e, { data: d })}
        {...extractLayerProps(restProps, 'bars-bar')}
      />
    {/each}
  {/if}
</Group>
