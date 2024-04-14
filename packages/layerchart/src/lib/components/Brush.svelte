<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte';
  import { extent } from 'd3-array';

  import { clamp, cls } from 'svelte-ux';
  import Frame from './Frame.svelte';
  import Group from './Group.svelte';
  import { localPoint } from '$lib/utils/event.js';

  const { xScale, xDomain, width, height, padding } = getContext('LayerCake');

  const dispatch = createEventDispatcher<{
    change: { xDomain?: [any, any]; yDomain?: [any, any] };
  }>();

  // export let axis: 'x' | 'y' | 'both' = 'x';
  export let handleWidth = 5;

  export let min: number | null = null;
  export let max: number | null = null;

  export let classes: {
    root?: string;
    range?: string;
    handle?: string;
  } = {};

  let frameEl: SVGRectElement;

  $: [xDomainMin, xDomainMax] = extent($xDomain);

  function handler(
    fn: (start: { min: number; max: number; value: number }, value: number) => void
  ) {
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

      const start = {
        min: min ?? xDomainMin,
        max: max ?? xDomainMax,
        value: $xScale.invert(localPoint(frameEl, e)?.x - $padding.left),
      };

      const onMove = (e: MouseEvent | TouchEvent) => {
        if (e instanceof TouchEvent) {
          if (e instanceof TouchEvent && e.changedTouches.length !== 1) return;
          const touch = e.changedTouches[0];
          if (touch.identifier !== startTouch?.identifier) return;
          fn(start, $xScale.invert(localPoint(frameEl, touch)?.x - $padding.left));
        } else {
          fn(start, $xScale.invert(localPoint(frameEl, e)?.x - $padding.left));
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

  const reset = handler((start, value) => {
    min = clamp(Math.min(start.value, value), xDomainMin, xDomainMax);
    max = clamp(Math.max(start.value, value), xDomainMin, xDomainMax);
  });

  const adjustRange = handler((start, value) => {
    const d = clamp(value - start.value, xDomainMin - start.min, xDomainMax - start.max);
    min = Number(start.min) + d;
    max = Number(start.max) + d;
  });

  const adjustMin = handler((start, value) => {
    min = clamp(value > start.max ? start.max : value, xDomainMin, xDomainMax);
    max = clamp(value > start.max ? value : start.max, xDomainMin, xDomainMax);
  });

  const adjustMax = handler((start, value) => {
    min = clamp(value < start.min ? value : start.min, xDomainMin, xDomainMax);
    max = clamp(value < start.min ? start.min : value, xDomainMin, xDomainMax);
  });

  function clear() {
    min = null;
    max = null;
  }

  function selectAll() {
    min = xDomainMin;
    max = xDomainMax;
  }

  let lastExtents: [number | null, number | null] = [null, null];
  $: if (
    ((min == null && max == null) || min !== max) &&
    (lastExtents[0] !== min || lastExtents[1] !== max)
  ) {
    lastExtents = [min, max];
    dispatch('change', { xDomain: [min, max] });
  }

  $: left = $xScale(min);
  $: right = $xScale(max);
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
      on:dblclick={() => (min = xDomainMin)}
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
      on:dblclick={() => (max = xDomainMax)}
    />
  </Group>
</g>
