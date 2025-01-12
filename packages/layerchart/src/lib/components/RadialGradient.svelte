<script lang="ts">
  import { onDestroy } from 'svelte';
  import { uniqueId } from '@layerstack/utils';

  import { chartContext } from './ChartContext.svelte';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import { getComputedStyles } from '../utils/canvas.js';
  import { parsePercent } from '../utils/math.js';

  /** Unique id for linearGradient */
  export let id: string = uniqueId('radialGradient-');

  /** Array array of strings (colors), will equally distributed from 0-100%.  If array of tuples, will use first value as the offset, and second as color */
  export let stops: string[] | [string | number, string][] = [
    'var(--tw-gradient-from)',
    'var(--tw-gradient-to)',
  ];

  export let cx = '50%';
  export let cy = '50%';
  export let fx = cx;
  export let fy = cy;
  export let r = '50%';
  // TODO: Svelte / Typescript does not know `<radialRadiant fr="...">`
  // export let fr = '0%';

  /** Indicates how the gradient behaves if it starts or ends inside the bounds of the shape containing the gradient */
  export let spreadMethod: 'pad' | 'reflect' | 'repeat' = 'pad';

  export let transform: string | null | undefined = undefined;

  /** Define the coordinate system for attributes (i.e. gradientUnits) */
  export let units: 'objectBoundingBox' | 'userSpaceOnUse' = 'objectBoundingBox';

  const { width, height, padding } = chartContext();

  const canvasContext = getCanvasContext();
  const renderContext = canvasContext ? 'canvas' : 'svg';

  let canvasGradient: CanvasGradient;

  function render(ctx: CanvasRenderingContext2D) {
    // TODO: Set correct values: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createRadialGradient.  See also: LinearGradient
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 0);

    // Use `getComputedStyles()` to convert each stop (if using CSS variables and/or classes) to color values
    stops.forEach((stop, i) => {
      if (Array.isArray(stop)) {
        const { fill } = getComputedStyles(ctx.canvas, {
          styles: { fill: stop[1] },
          classes: $$props.class,
        });
        gradient.addColorStop(parsePercent(stop[0]), fill);
      } else {
        const { fill } = getComputedStyles(ctx.canvas, {
          styles: { fill: stop },
          classes: $$props.class,
        });
        gradient.addColorStop(i / (stops.length - 1), fill);
      }
    });

    canvasGradient = gradient;
  }

  let canvasUnregister: ReturnType<typeof canvasContext.register>;
  $: if (renderContext === 'canvas') {
    canvasUnregister = canvasContext.register({ name: 'Gradient', render });
  }

  $: if (renderContext === 'canvas') {
    // Redraw when props changes (TODO: styles, class, etc)
    stops && cx && cy && fx && fy && $width && $height;
    canvasContext.invalidate();
  }

  onDestroy(() => {
    if (renderContext === 'canvas') {
      canvasUnregister();
    }
  });
</script>

{#if renderContext === 'canvas'}
  <slot {id} gradient={canvasGradient} />
{:else if renderContext === 'svg'}
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
      {...$$restProps}
    >
      <slot name="stops">
        {#if stops}
          {#each stops as stop, i}
            {#if Array.isArray(stop)}
              <stop offset={stop[0]} stop-color={stop[1]} />
            {:else}
              <stop offset="{i * (100 / (stops.length - 1))}%" stop-color={stop} />
            {/if}
          {/each}
        {/if}
      </slot>
    </radialGradient>
  </defs>

  <slot {id} gradient="url(#{id})" />
{/if}
