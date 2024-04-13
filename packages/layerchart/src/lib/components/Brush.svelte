<script lang="ts">
  import { scaleLinear } from 'd3-scale';
  import { createEventDispatcher, getContext } from 'svelte';

  import { clamp, cls } from 'svelte-ux';
  import Frame from './Frame.svelte';
  import Group from './Group.svelte';

  let min: number | null = null;
  let max: number | null = null;

  export let handleWidth = 5;

  let frameEl: SVGRectElement;

  const dispatch = createEventDispatcher<{
    change: { xDomain?: [any, any]; yDomain?: [any, any] };
  }>();

  const { xScale, width, height } = getContext('LayerCake');

  export let classes: {
    root?: string;
    range?: string;
    handle?: string;
  } = {};

  /**
   * Convert pixel value `x` to percent of element's width
   */
  function pixelToPercent(x: number) {
    const { left, right } = frameEl.getBoundingClientRect();
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
        } else if (e.target === frameEl) {
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

  function selectAll() {
    min = 0;
    max = 1;
  }

  // Map percentage back to domain
  $: domainScale = $xScale.copy().range([0, 1]);

  // Track last min/max to fix infinite loop
  let lastExtents: [number | null, number | null] = [null, null];
  $: if (
    ((min == null && max == null) || min !== max) &&
    (lastExtents[0] !== min || lastExtents[1] !== max)
  ) {
    lastExtents = [min, max];
    dispatch('change', { xDomain: [domainScale.invert(min ?? 0), domainScale.invert(max ?? 1)] });
  }

  $: left = $width * (min ?? 0);
  $: right = $width * (max ?? 0);
</script>

<g class="Brush">
  <Frame
    class={cls('frame', 'fill-transparent')}
    on:mousedown={reset}
    on:touchstart={reset}
    on:dblclick={() => selectAll()}
    bind:rectEl={frameEl}
  />

  <Group
    class="range"
    x={left}
    on:mousedown={adjustRange}
    on:touchstart={adjustRange}
    on:dblclick={() => clear()}
  >
    <rect
      width={right - left}
      height={$height}
      class={cls('fill-surface-content/10 cursor-move select-none')}
    />
  </Group>

  <Group class="handle min" x={left} on:mousedown={adjustMin} on:touchstart={adjustMin}>
    <rect
      width={handleWidth}
      height={$height}
      class={cls('fill-transparent cursor-ew-resize select-none')}
    />
  </Group>

  <Group
    class="handle max"
    x={right - handleWidth + 1}
    on:mousedown={adjustMax}
    on:touchstart={adjustMax}
  >
    <rect
      width={handleWidth}
      height={$height}
      class={cls('fill-transparent cursor-ew-resize select-none')}
    />
  </Group>
</g>
