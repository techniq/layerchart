<script lang="ts">
  import { onDestroy } from 'svelte';
  import { uniqueId } from '@layerstack/utils';

  import { chartContext } from './ChartContext.svelte';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import { getComputedStyles } from '../utils/canvas.js';
  import { parsePercent } from '../utils/math.js';

  /** Unique id for linearGradient */
  export let id: string = uniqueId('linearGradient-');

  /** Array array of strings (colors), will equally distributed from 0-100%.  If array of tuples, will use first value as the offset, and second as color */
  export let stops: string[] | [string | number, string][] = [
    'var(--tw-gradient-from)',
    'var(--tw-gradient-to)',
  ];

  /** Apply color stops top-to-bottom (true) or left-to-right (false) */
  export let vertical = false;
  export let x1 = '0%';
  export let y1 = '0%';
  export let x2 = vertical ? '0%' : '100%';
  export let y2 = vertical ? '100%' : '0%';

  export let rotate: number | undefined = undefined;

  /** Define the coordinate system for attributes (i.e. gradientUnits) */
  export let units: 'objectBoundingBox' | 'userSpaceOnUse' = 'objectBoundingBox';

  const { width, height, padding } = chartContext();

  const canvasContext = getCanvasContext();
  const renderContext = canvasContext ? 'canvas' : 'svg';

  let canvasGradient: CanvasGradient;

  function render(ctx: CanvasRenderingContext2D) {
    // TODO: Use x1/y1/x2/y2 values (convert from pecentage strings)
    const gradient = ctx.createLinearGradient(
      $padding.left,
      $padding.top,
      vertical ? $padding.left : $width - $padding.right,
      vertical ? $height + $padding.bottom : $padding.top
    );

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
    stops && x1 && y1 && x2 && y2 && $width && $height;
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
    <linearGradient
      {id}
      {x1}
      {y1}
      {x2}
      {y2}
      gradientTransform={rotate ? `rotate(${rotate})` : ''}
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
    </linearGradient>
  </defs>

  <slot {id} gradient="url(#{id})" />
{/if}
