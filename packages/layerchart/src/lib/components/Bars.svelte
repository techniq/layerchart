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
  } & Omit<BarPropsWithoutHTML, 'bar' | 'children'>;

  export type BarsProps = BarsPropsWithoutHTML & Omit<BarProps, 'bar'>;
</script>

<script lang="ts">
  import Bar, { type BarProps, type BarPropsWithoutHTML } from './Bar.svelte';
  import { chartDataArray } from '../utils/common.js';
  import { getChartContext } from './Chart-Next.svelte';
  import type { Snippet } from 'svelte';

  let {
    fill,
    key = (_, i) => i,
    data: dataProp,
    onBarClick = () => {},
    children,
    ...restProps
  }: BarsProps = $props();

  const ctx = getChartContext();
  const data = $derived(chartDataArray(dataProp ?? ctx.data));
</script>

<g class="Bars">
  {#if children}
    {@render children()}
  {:else}
    {#each data as d, i (key(d, i))}
      <Bar
        bar={d}
        fill={fill ?? (ctx.config.c ? ctx.cGet(d) : null)}
        onclick={(e) => onBarClick(e, { data: d })}
        {...restProps}
      />
    {/each}
  {/if}
</g>
