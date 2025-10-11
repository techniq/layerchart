<script lang="ts" module>
  import { asAny, type Without } from '$lib/utils/types.js';
  import type { SVGAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  export type LinearGradientPropsWithoutHTML = {
    /**
     * Unique id for linearGradient
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

    /**
     * Render as a child of the gradient and will opt out of the default stops
     * being rendered.
     */
    stopsContent?: Snippet;

    children?: Snippet<[{ id: string; gradient: string }]>;
  };

  export type LinearGradientProps = LinearGradientPropsWithoutHTML &
    Without<SVGAttributes<SVGLinearGradientElement>, LinearGradientPropsWithoutHTML>;
</script>

<script lang="ts">
  import { getRenderContext } from './Chart.svelte';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { registerCanvasComponent } from './layout/Canvas.svelte';
  import { createLinearGradient, getComputedStyles } from '../utils/canvas.js';
  import { parsePercent } from '../utils/math.js';
  import { createId } from '$lib/utils/createId.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { cls } from '@layerstack/tailwind';

  const uid = $props.id();

  let {
    id = createId('linearGradient-', uid),
    stops = ['var(--tw-gradient-from)', 'var(--tw-gradient-to)'],
    vertical = false,
    x1 = '0%',
    y1 = '0%',
    x2 = vertical ? '0%' : '100%',
    y2 = vertical ? '100%' : '0%',
    rotate,
    units = 'objectBoundingBox',
    ref: refProp = $bindable(),
    class: className,
    stopsContent,
    children,
    ...restProps
  }: LinearGradientProps = $props();

  let ref = $state<SVGLinearGradientElement>();
  $effect.pre(() => {
    refProp = ref;
  });

  const ctx = getChartContext();
  const renderCtx = getRenderContext();

  let canvasGradient = $state<CanvasGradient>();

  function createCSSGradient(): string {
    if (!stops?.length) return '';

    let direction: string;
    if (rotate !== undefined) {
      // Convert SVG rotation to CSS linear-gradient angle
      // SVG: rotate(0) on horizontal gradient = left-to-right = CSS 90deg
      // SVG: rotate(0) on vertical gradient = top-to-bottom = CSS 180deg
      const baseAngle = vertical ? 180 : 90;
      const cssAngle = baseAngle + rotate;
      direction = `${cssAngle}deg`;
    } else {
      // Use direction keywords when no rotation is specified
      direction = vertical ? 'to bottom' : 'to right';
    }

    const cssStops = stops
      .map((stop, i) => {
        if (Array.isArray(stop)) {
          return `${stop[1]} ${stop[0]}`;
        } else {
          return `${stop} ${i * (100 / (stops.length - 1))}%`;
        }
      })
      .join(', ');

    return `linear-gradient(${direction}, ${cssStops})`;
  }

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

  if (renderCtx === 'canvas') {
    registerCanvasComponent({
      name: 'Gradient',
      render,
      deps: () => [x1, y1, x2, y2, stops, className],
    });
  }
</script>

{#if renderCtx === 'canvas'}
  <!--
	TODO: we can probably pass the context to coerce this type so we don't need a bunch
	of predicates to check if the gradient is a CanvasGradient or not...
	-->
  {@render children?.({ id, gradient: asAny(canvasGradient) })}
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
      {...extractLayerProps(restProps, 'lc-linear-gradient')}
    >
      {#if stopsContent}
        {@render stopsContent?.()}
      {:else if stops}
        {#each stops as stop, i}
          {#if Array.isArray(stop)}
            <stop
              offset={stop[0]}
              stop-color={stop[1]}
              class={cls('lc-linear-gradient-stop', className)}
            />
          {:else}
            <stop
              offset="{i * (100 / (stops.length - 1))}%"
              stop-color={stop}
              class={cls('lc-linear-gradient-stop', className)}
            />
          {/if}
        {/each}
      {/if}
    </linearGradient>
  </defs>

  {@render children?.({ id, gradient: `url(#${id})` })}
{:else if renderCtx === 'html'}
  {@render children?.({ id, gradient: createCSSGradient() })}
{/if}
