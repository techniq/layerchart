<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte';
  import { extent } from 'd3-array';

  import { clamp, cls } from 'svelte-ux';
  import Frame from './Frame.svelte';
  import Group from './Group.svelte';
  import { localPoint } from '$lib/utils/event.js';

  const { xScale, xDomain: xDomainContext, width, height, padding } = getContext('LayerCake');

  const dispatch = createEventDispatcher<{
    change: { xDomain?: [any, any]; yDomain?: [any, any] };
    brushStart: { xDomain?: [any, any]; yDomain?: [any, any] };
    brushEnd: { xDomain?: [any, any]; yDomain?: [any, any] };
  }>();

  // export let axis: 'x' | 'y' | 'both' = 'x';
  export let handleWidth = 5;

  /** Only show range while actively brushing.  Useful with `brushEnd` event */
  export let clearOnEnd = false;

  export let xDomain: [number | null, number | null] = [null, null];

  export let classes: {
    root?: string;
    range?: string;
    handle?: string;
  } = {};

  let frameEl: SVGRectElement;

  $: [xDomainMin, xDomainMax] = extent($xDomainContext);

  function handler(
    fn: (start: { xDomain: [number, number]; value: number }, value: number) => void
  ) {
    return (e: PointerEvent) => {
      const start = {
        xDomain: [xDomain[0] ?? xDomainMin, xDomain[1] ?? xDomainMax],
        value: $xScale.invert(localPoint(frameEl, e)?.x - $padding.left),
      };

      dispatch('brushStart', { xDomain });

      const onPointerMove = (e: PointerEvent) => {
        fn(start, $xScale.invert(localPoint(frameEl, e)?.x - $padding.left));

        if (xDomain[0] === xDomain[1]) {
          // Ignore?
        } else {
          dispatch('change', { xDomain });
        }
      };

      const onPointerUp = (e: PointerEvent) => {
        if (e.target === frameEl) {
          clear();
        }

        dispatch('brushEnd', { xDomain });

        if (clearOnEnd) {
          clear();
        }

        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    };
  }

  const reset = handler((start, value) => {
    xDomain = [
      clamp(Math.min(start.value, value), xDomainMin, xDomainMax),
      clamp(Math.max(start.value, value), xDomainMin, xDomainMax),
    ];
  });

  const adjustRange = handler((start, value) => {
    const d = clamp(
      value - start.value,
      xDomainMin - start.xDomain[0],
      xDomainMax - start.xDomain[1]
    );
    xDomain = [Number(start.xDomain[0]) + d, Number(start.xDomain[1]) + d];
  });

  const adjustMin = handler((start, value) => {
    xDomain = [
      clamp(value > start.xDomain[1] ? start.xDomain[1] : value, xDomainMin, xDomainMax),
      clamp(value > start.xDomain[1] ? value : start.xDomain[1], xDomainMin, xDomainMax),
    ];
  });

  const adjustMax = handler((start, value) => {
    xDomain = [
      clamp(value < start.xDomain[0] ? value : start.xDomain[0], xDomainMin, xDomainMax),
      clamp(value < start.xDomain[0] ? start.xDomain[0] : value, xDomainMin, xDomainMax),
    ];
  });

  function clear() {
    xDomain = [null, null];
  }

  function selectAll() {
    xDomain = [xDomainMin, xDomainMax];
  }

  $: left = $xScale(xDomain[0]);
  $: right = $xScale(xDomain[1]);
</script>

<g class="Brush">
  <Frame
    class={cls('frame', 'fill-transparent')}
    on:pointerdown={reset}
    on:dblclick={() => selectAll()}
    bind:rectEl={frameEl}
  />

  <Group class="range" x={left} on:pointerdown={adjustRange} on:dblclick={() => clear()}>
    <rect
      width={right - left}
      height={$height}
      class={cls('fill-surface-content/10 cursor-move select-none')}
    />
  </Group>

  <Group class="handle min" x={left} on:pointerdown={adjustMin}>
    <rect
      width={handleWidth}
      height={$height}
      class={cls('fill-transparent cursor-ew-resize select-none')}
      on:dblclick={() => (xDomain[0] = xDomainMin)}
    />
  </Group>

  <Group class="handle max" x={right - handleWidth + 1} on:pointerdown={adjustMax}>
    <rect
      width={handleWidth}
      height={$height}
      class={cls('fill-transparent cursor-ew-resize select-none')}
      on:dblclick={() => (xDomain[1] = xDomainMax)}
    />
  </Group>
</g>
