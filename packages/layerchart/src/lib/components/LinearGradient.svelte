<script lang="ts" module>
  import type { Without } from 'layerchart/utils/types.js';
  import type { SVGAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  export type LinearGradientPropsWithoutHTML = {
    /**
     * Unique id for linearGradient
     *
     * @default `uniqueId('linearGradient-')`
     */
    id?: string;

    /**
     * Array array of strings (colors), will equally distributed from 0-100%.
     * If array of tuples, will use first value as the offset, and second as color
     *
     * @default `['var(--tw-gradient-from)', 'var(--tw-gradient-to)']`
     */
    stops?: string[] | [string | number, string][];

    /**
     * Apply color stops top-to-bottom (true) or left-to-right (false)
     *
     * @default false
     */
    vertical?: boolean;

    /**
     * @default '0%'
     */
    x1?: string;

    /**
     * @default '0%'
     */
    y1?: string;

    /**
     * @default vertical ? '0%' : '100%'
     */
    x2?: string;
    /**
     * @default vertical ? '100%' : '0%'
     */
    y2?: string;

    /**
     * Rotate the gradient by a given angle in degrees
     */
    rotate?: number;

    /**
     * Define the coordinate system for attributes (i.e. gradientUnits)
     *
     * @default 'objectBoundingBox'
     */
    units?: 'objectBoundingBox' | 'userSpaceOnUse';

    /**
     * A bindable reference to the underlying `<linearGradient>` element
     *
     * @bindable
     */
    ref?: SVGLinearGradientElement;

    children?: Snippet<[{ id: string; gradient: CanvasGradient | undefined | string }]>;

    /**
     * Render as a child of the gradient and will opt out of the default stops
     * being rendered.
     */
    stopsContent?: Snippet;
  };

  export type LinearGradientProps = LinearGradientPropsWithoutHTML &
    Without<SVGAttributes<SVGLinearGradientElement>, LinearGradientPropsWithoutHTML>;
</script>

<script lang="ts">
  import { uniqueId } from '@layerstack/utils';

  import { getRenderContext } from './Chart.svelte';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import { createLinearGradient, getComputedStyles } from '../utils/canvas.js';
  import { parsePercent } from '../utils/math.js';
  import { getChartContext } from './Chart-Next.svelte';

  let {
    id = uniqueId('linearGradient-'),
    stops = ['var(--tw-gradient-from)', 'var(--tw-gradient-to)'],
    vertical = false,
    x1 = '0%',
    y1 = '0%',
    x2 = vertical ? '0%' : '100%',
    y2 = vertical ? '100%' : '0%',
    rotate,
    units = 'objectBoundingBox',
    ref = $bindable(),
    class: className,
    stopsContent,
    children,
    ...restProps
  }: LinearGradientProps = $props();

  const ctx = getChartContext();
  const renderCtx = getRenderContext();
  const canvasCtx = getCanvasContext();

  let canvasGradient = $state<CanvasGradient>();

  function render(_ctx: CanvasRenderingContext2D) {
    // Use `getComputedStyles()` to convert each stop (if using CSS variables and/or classes) to color values
    const _stops = stops.map((stop, i) => {
      if (Array.isArray(stop)) {
        const { fill } = getComputedStyles(_ctx.canvas, {
          styles: { fill: stop[1] },
          classes: className,
        });
        return { offset: parsePercent(stop[0]), color: fill };
      } else {
        const { fill } = getComputedStyles(_ctx.canvas, {
          styles: { fill: stop },
          classes: className,
        });
        return { offset: i / (stops.length - 1), color: fill };
      }
    });

    // TODO: Use x1/y1/x2/y2 values (convert from percentage strings)
    const gradient = createLinearGradient(
      _ctx,
      ctx.padding.left,
      ctx.padding.top,
      vertical ? ctx.padding.left : ctx.width - ctx.padding.right,
      vertical ? ctx.height + ctx.padding.bottom : ctx.padding.top,
      _stops
    );

    canvasGradient = gradient;
  }

  $effect(() => {
    if (renderCtx !== 'canvas') return;
    [x1, y1, x2, y2, stops, className];
    canvasCtx.invalidate();
  });

  $effect(() => {
    if (renderCtx !== 'canvas') return;
    return canvasCtx.register({
      name: 'Gradient',
      render,
    });
  });
</script>

{#if renderCtx === 'canvas'}
  {@render children?.({ id, gradient: canvasGradient })}
{:else if renderCtx === 'svg'}
  <defs>
    <linearGradient
      bind:this={ref}
      {id}
      {x1}
      {y1}
      {x2}
      {y2}
      gradientTransform={rotate ? `rotate(${rotate})` : ''}
      gradientUnits={units}
      {...restProps}
    >
      {#if stopsContent}
        {@render stopsContent?.()}
      {:else if stops}
        {#each stops as stop, i}
          {#if Array.isArray(stop)}
            <stop offset={stop[0]} stop-color={stop[1]} class={className} />
          {:else}
            <stop offset="{i * (100 / (stops.length - 1))}%" stop-color={stop} class={className} />
          {/if}
        {/each}
      {/if}
    </linearGradient>
  </defs>

  {@render children?.({ id, gradient: `url(#${id})` })}
{/if}
