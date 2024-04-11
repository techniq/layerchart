<script lang="ts">
  import { scaleLinear } from 'd3-scale';
  import { createEventDispatcher, getContext } from 'svelte';

  import { clamp, cls } from 'svelte-ux';

  let min: number | null = null;
  let max: number | null = null;

  let brushEl: HTMLDivElement;

  const dispatch = createEventDispatcher<{
    change: { xDomain?: [any, any]; yDomain?: [any, any] };
  }>();

  const { xScale, padding } = getContext('LayerCake');

  export let classes: {
    root?: string;
    range?: string;
    handle?: string;
  } = {};

  /**
   * Convert pixel value `x` to percent of element's width
   */
  function pixelToPercent(x: number) {
    const { left, right } = brushEl.getBoundingClientRect();
    const scale = scaleLinear([left, right], [0, 1]).clamp(true);
    return scale(x);
  }

  function handler(fn: (start: { min: number; max: number; p: number }, p: number) => void) {
    return (e: MouseEvent | TouchEvent) => {
      let startTouch: Touch | null = null;
      let clientX: number;

      if (e instanceof TouchEvent) {
        if (e.touches.length !== 1) return;
        startTouch = e.touches[0];
        clientX = startTouch.clientX;
      } else {
        clientX = e.clientX;
      }

      const start = { min: min ?? 0, max: max ?? 1, p: pixelToPercent(clientX) };

      const onMove = (e: MouseEvent | TouchEvent) => {
        if (e instanceof TouchEvent) {
          if (e instanceof TouchEvent && e.changedTouches.length !== 1) return;
          const touch = e.changedTouches[0];
          if (touch.identifier !== startTouch?.identifier) return;
          fn(start, pixelToPercent(touch.clientX));
        } else {
          fn(start, pixelToPercent(e.clientX));
        }
      };

      const onEnd = (e: MouseEvent | TouchEvent) => {
        if (e instanceof TouchEvent) {
          if (e.changedTouches.length !== 1) return;
          if (e.changedTouches[0].identifier !== startTouch?.identifier) return;
        } else if (e.target === brushEl) {
          clear();
        }

        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onEnd);

        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onEnd);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);

      window.addEventListener('touchmove', onMove);
      window.addEventListener('touchend', onEnd);
    };
  }

  const reset = handler((start, p) => {
    min = clamp(Math.min(start.p, p), 0, 1);
    max = clamp(Math.max(start.p, p), 0, 1);
  });

  const adjustRange = handler((start, p) => {
    const d = clamp(p - start.p, -start.min, 1 - start.max);
    min = start.min + d;
    max = start.max + d;
  });

  const adjustMin = handler((start, p) => {
    min = p > start.max ? start.max : p;
    max = p > start.max ? p : start.max;
  });

  const adjustMax = handler((start, p) => {
    min = p < start.min ? p : start.min;
    max = p < start.min ? start.min : p;
  });

  function clear() {
    min = null;
    max = null;
  }

  // Map percentage back to domain
  $: domainScale = $xScale.copy().range([0, 1]);

  // Track last min/max to fix infinite loop
  let lastExtents: [number | null, number | null] = [null, null];
  $: console.log({ min, max, lastExtents });
  $: if (
    ((min == null && max == null) || min !== max) &&
    (lastExtents[0] !== min || lastExtents[1] !== max)
  ) {
    lastExtents = [min, max];
    console.log('dispatching change');
    dispatch('change', { xDomain: [domainScale.invert(min ?? 0), domainScale.invert(max ?? 1)] });
  }

  $: left = 100 * (min ?? 0);
  $: right = 100 * (1 - (max ?? 1));
</script>

<div
  bind:this={brushEl}
  class={cls('Brush', 'relative h-full select-none', classes.root, $$props.class)}
  style:margin-left="{$padding.left}px"
  style:margin-right="{$padding.right}px"
  on:mousedown|stopPropagation={reset}
  on:touchstart|stopPropagation={reset}
>
  {#if min != null}
    <div
      class={cls('range', 'absolute h-full bg-surface-content/10 cursor-move', classes.range)}
      style:left="{left}%"
      style:right="{right}%"
      on:mousedown|stopPropagation={adjustRange}
      on:touchstart|stopPropagation={adjustRange}
    />

    <div
      class={cls('handle', 'absolute w-2 h-full cursor-ew-resize -translate-x-1/2', classes.handle)}
      style:left="{left}%"
      on:mousedown|stopPropagation={adjustMin}
      on:touchstart|stopPropagation={adjustMin}
    />
    <div
      class={cls('handle', 'absolute w-2 h-full cursor-ew-resize translate-x-1/2', classes.handle)}
      style:right="{right}%"
      on:mousedown|stopPropagation={adjustMax}
      on:touchstart|stopPropagation={adjustMax}
    />
  {/if}
</div>
