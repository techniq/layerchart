<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { Without } from '$lib/utils/types.js';
  import type { SVGAttributes } from 'svelte/elements';

  export type RadialGradientPropsWithoutHTML = {
    /**
     * Unique id for radialGradient
     */
    id?: string;

    /**
     * Array array of strings (colors), will equally distributed from 0-100%.
     * If array of tuples, will use first value as the offset, and second as color
     *
     * @default ['var(--tw-gradient-from)', 'var(--tw-gradient-to)']
     */
    stops?: string[] | [string | number, string][];

    /**
     * The x coordinate of the center of the gradient
     * @default '50%'
     */
    cx?: string;

    /**
     * The y coordinate of the center of the gradient
     * @default '50%'
     */
    cy?: string;

    /**
     * The x coordinate of the focal point of the gradient
     * @default cx
     */
    fx?: string;

    /**
     * The y coordinate of the focal point of the gradient
     * @default cy
     */
    fy?: string;

    /**
     * The radius of the gradient
     */
    r?: string;

    // TODO: Svelte / Typescript does not know `<radialRadiant fr="...">`
    // fr = '0%';

    /**
     * Indicates how the gradient behaves if it starts or ends inside the bounds
     * of the shape containing the gradient
     *
     * @default 'pad'
     */
    spreadMethod?: 'pad' | 'reflect' | 'repeat';

    /**
     * Transform attribute for the gradient
     */
    transform?: string | null;

    /**
     * Define the coordinate system for attributes (i.e. gradientUnits)
     *
     * @default 'objectBoundingBox'
     */
    units?: 'objectBoundingBox' | 'userSpaceOnUse';

    children?: Snippet<[{ id: string; gradient: string }]>;

    /**
     * Render as a child of the gradient and will opt out of the default stops
     * being rendered.
     */
    stopsContent?: Snippet;
  };

  export type RadialGradientProps = RadialGradientPropsWithoutHTML &
    Without<SVGAttributes<SVGRadialGradientElement>, RadialGradientPropsWithoutHTML>;
</script>

<script lang="ts">
  import { getRenderContext } from './Chart.svelte';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import { getComputedStyles } from '../utils/canvas.js';
  import { parsePercent } from '../utils/math.js';
  import { getChartContext } from './Chart.svelte';
  import { createId } from '$lib/utils/createId.js';
  import { extractLayerProps, layerClass } from '$lib/utils/attributes.js';
  import { cls } from '@layerstack/tailwind';

  const uid = $props.id();

  let {
    id = createId('radialGradient-', uid),
    stops = ['var(--tw-gradient-from)', 'var(--tw-gradient-to)'],
    cx = '50%',
    cy = '50%',
    fx = cx,
    fy = cy,
    r = '50%',
    spreadMethod = 'pad',
    transform = undefined,
    units = 'objectBoundingBox',
    children,
    stopsContent,
    class: className,
    ...restProps
  }: RadialGradientProps = $props();

  // TODO: Svelte / Typescript does not know `<radialRadiant fr="...">`
  // export let fr = '0%';

  const ctx = getChartContext();

  const renderCtx = getRenderContext();
  const canvasCtx = getCanvasContext();

  let canvasGradient = $state<CanvasGradient>();

  function render(_ctx: CanvasRenderingContext2D) {
    // TODO: Set correct values: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createRadialGradient.  See also: LinearGradient
    // TODO: Memoize `createRadialGradient()` (see LinearGradient)
    const gradient = _ctx.createRadialGradient(0, 0, 0, 0, 0, 0);

    // Use `getComputedStyles()` to convert each stop (if using CSS variables and/or classes) to color values
    for (let i = 0; i < stops.length; i++) {
      const stop = stops[i];
      if (Array.isArray(stop)) {
        const { fill } = getComputedStyles(_ctx.canvas, {
          styles: { fill: stop[1] },
          classes: className,
        });
        gradient.addColorStop(parsePercent(stop[0]), fill);
      } else {
        const { fill } = getComputedStyles(_ctx.canvas, {
          styles: { fill: stop },
          classes: className,
        });
        gradient.addColorStop(i / (stops.length - 1), fill);
      }
    }

    canvasGradient = gradient;
  }

  $effect(() => {
    if (renderCtx !== 'canvas') return;
    return canvasCtx.register({
      name: 'Gradient',
      render,
    });
  });

  $effect(() => {
    if (renderCtx !== 'canvas') return;
    // Redraw when props changes (TODO: styles, class, etc)
    [stops, cx, cy, fx, fy, ctx.width, ctx.height];
    canvasCtx.invalidate();
  });
</script>

{#if renderCtx === 'canvas'}
  {@render children?.({ id, gradient: canvasGradient as any })}
{:else if renderCtx === 'svg'}
  <defs>
    <radialGradient
      {id}
      {cx}
      {cy}
      {fx}
      {fy}
      {r}
      {spreadMethod}
      gradientTransform={transform}
      gradientUnits={units}
      {...extractLayerProps({ ...restProps, class: className }, 'radial-gradient')}
    >
      {#if stopsContent}
        {@render stopsContent()}
      {:else if stops}
        {@const stopClass = cls(layerClass('radial-gradient-stop'), className)}
        {#each stops as stop, i}
          {#if Array.isArray(stop)}
            <stop offset={stop[0]} stop-color={stop[1]} class={stopClass} />
          {:else}
            <stop offset="{i * (100 / (stops.length - 1))}%" stop-color={stop} class={stopClass} />
          {/if}
        {/each}
      {/if}
    </radialGradient>
  </defs>

  {@render children?.({ id, gradient: `url(#${id})` })}
{/if}
