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

    /**
     * Series key to use for accessor. Only applicable if `<Chart>` uses `series`.
     */
    seriesKey?: string;

    /**
     * Padding between stacked bars.
     */
    stackPadding?: number;

    children?: Snippet;
    // TODO: investigate
    [key: string]: any;
  } & Omit<BarPropsWithoutHTML, 'data' | 'children' | 'seriesKey' | 'stackPadding'>;

  export type BarsProps = BarsPropsWithoutHTML & Omit<BarProps, 'data'>;
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';

  import Bar, { type BarProps, type BarPropsWithoutHTML } from './Bar.svelte';
  import Group from './Group.svelte';

  import { getChartContext } from '$lib/contexts/chart.js';
  import { chartDataArray } from '../utils/common.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  let {
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
  }: BarsProps = $props();

  const ctx = getChartContext();

  ctx.registerComponentNode({
    name: 'Bars',
    kind: 'mark',
    markInfo: () => ({ data: dataProp, seriesKey, color: fill as string | undefined }),
  });

  // Get series data if seriesKey is provided
  const series = $derived(
    seriesKey ? ctx.series.series.find((s) => s.key === seriesKey) : undefined
  );
  const seriesData = $derived(series?.data);
  const data = $derived(chartDataArray(dataProp ?? seriesData ?? ctx.data));
</script>

<Group class="lc-bars">
  {#if children}
    {@render children()}
  {:else}
    {#each data as d, i (key(d, i))}
      <Bar
        data={d}
        {radius}
        {strokeWidth}
        {stroke}
        {seriesKey}
        {stackPadding}
        fill={fill ?? series?.color ?? (ctx.config.c ? ctx.cGet(d) : null)}
        onclick={(e) => onBarClick(e, { data: d })}
        {...extractLayerProps(restProps, 'lc-bars-bar')}
      />
    {/each}
  {/if}
</Group>
