<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte';
  import { extent } from 'd3-array';

  import { clamp, cls } from 'svelte-ux';
  import Frame from './Frame.svelte';
  import Group from './Group.svelte';
  import { localPoint } from '$lib/utils/event.js';

  /*
    TODO:
    - [ ] Handle resetting back to original domain (ex. yDomain={[0, null]})
  */

  const { xScale, yScale, width, height, padding } = getContext('LayerCake');

  const dispatch = createEventDispatcher<{
    change: { xDomain?: [any, any]; yDomain?: [any, any] };
    brushStart: { xDomain?: [any, any]; yDomain?: [any, any] };
    brushEnd: { xDomain?: [any, any]; yDomain?: [any, any] };
  }>();

  export let axis: 'x' | 'y' | 'both' = 'x';

  /** Size of draggable handles (width/height) */
  export let handleSize = 5;

  /** Only show range while actively brushing.  Useful with `brushEnd` event */
  export let clearOnEnd = false;

  export let xDomain: [number | null, number | null] = [null, null];
  export let yDomain: [number | null, number | null] = [null, null];

  export let classes: {
    root?: string;
    range?: string;
    handle?: string;
  } = {};

  let frameEl: SVGRectElement;

  $: [xDomainMin, xDomainMax] = extent($xScale.domain());
  $: [yDomainMin, yDomainMax] = extent($yScale.domain());

  function handler(
    fn: (
      start: {
        xDomain: [number, number];
        yDomain: [number, number];
        value: { x: number; y: number };
      },
      value: { x: number; y: number }
    ) => void
  ) {
    return (e: PointerEvent) => {
      const start = {
        xDomain: [xDomain[0] ?? xDomainMin, xDomain[1] ?? xDomainMax],
        yDomain: [yDomain[0] ?? yDomainMin, yDomain[1] ?? yDomainMax],
        value: {
          x: $xScale.invert(localPoint(frameEl, e)?.x - $padding.left),
          y: $yScale.invert(localPoint(frameEl, e)?.y - $padding.top),
        },
      };

      dispatch('brushStart', { xDomain, yDomain });

      const onPointerMove = (e: PointerEvent) => {
        fn(start, {
          x: $xScale.invert(localPoint(frameEl, e)?.x - $padding.left),
          y: $yScale.invert(localPoint(frameEl, e)?.y - $padding.top),
        });

        if (xDomain[0] === xDomain[1] || yDomain[0] === yDomain[1]) {
          // Ignore?
          // TODO: What about when using `x` or `y` axis?
        } else {
          dispatch('change', { xDomain, yDomain });
        }
      };

      const onPointerUp = (e: PointerEvent) => {
        if (e.target === frameEl) {
          clear();
        }

        dispatch('brushEnd', { xDomain, yDomain });

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
      clamp(Math.min(start.value.x, value.x), xDomainMin, xDomainMax),
      clamp(Math.max(start.value.x, value.x), xDomainMin, xDomainMax),
    ];

    yDomain = [
      clamp(Math.min(start.value.y, value.y), yDomainMin, yDomainMax),
      clamp(Math.max(start.value.y, value.y), yDomainMin, yDomainMax),
    ];
  });

  const adjustRange = handler((start, value) => {
    const dx = clamp(
      value.x - start.value.x,
      xDomainMin - start.xDomain[0],
      xDomainMax - start.xDomain[1]
    );
    xDomain = [Number(start.xDomain[0]) + dx, Number(start.xDomain[1]) + dx];

    const dy = clamp(
      value.y - start.value.y,
      yDomainMin - start.yDomain[0],
      yDomainMax - start.yDomain[1]
    );
    yDomain = [Number(start.yDomain[0]) + dy, Number(start.yDomain[1]) + dy];
  });

  const adjustMin = handler((start, value) => {
    xDomain = [
      clamp(value.x > start.xDomain[1] ? start.xDomain[1] : value.x, xDomainMin, xDomainMax),
      clamp(value.x > start.xDomain[1] ? value.x : start.xDomain[1], xDomainMin, xDomainMax),
    ];

    yDomain = [
      clamp(value.y > start.yDomain[1] ? start.yDomain[1] : value.y, yDomainMin, yDomainMax),
      clamp(value.y > start.yDomain[1] ? value.y : start.yDomain[1], yDomainMin, yDomainMax),
    ];
  });

  const adjustMax = handler((start, value) => {
    xDomain = [
      clamp(value.x < start.xDomain[0] ? value.x : start.xDomain[0], xDomainMin, xDomainMax),
      clamp(value.x < start.xDomain[0] ? start.xDomain[0] : value.x, xDomainMin, xDomainMax),
    ];

    yDomain = [
      clamp(value.y < start.yDomain[0] ? value.y : start.yDomain[0], yDomainMin, yDomainMax),
      clamp(value.y < start.yDomain[0] ? start.yDomain[0] : value.y, yDomainMin, yDomainMax),
    ];
  });

  function clear() {
    xDomain = [null, null];
    yDomain = [null, null];
  }

  function selectAll() {
    xDomain = [xDomainMin, xDomainMax];
    yDomain = [yDomainMin, yDomainMax];
  }

  $: top = $yScale(yDomain[1]);
  $: bottom = $yScale(yDomain[0]);
  $: left = $xScale(xDomain[0]);
  $: right = $xScale(xDomain[1]);

  $: console.log({ top, bottom, left, right });

  $: rangeTop = axis === 'both' || axis === 'y' ? top : 0;
  $: rangeLeft = axis === 'both' || axis === 'x' ? left : 0;
  $: rangeWidth = axis === 'both' || axis === 'x' ? right - left : $width;
  $: rangeHeight = axis === 'both' || axis === 'y' ? bottom - top : $height;
</script>

<g class="Brush">
  <Frame
    class={cls('frame', 'fill-transparent')}
    on:pointerdown={reset}
    on:dblclick={() => selectAll()}
    bind:rectEl={frameEl}
  />

  <Group
    class="range"
    x={rangeLeft}
    y={rangeTop}
    on:pointerdown={adjustRange}
    on:dblclick={() => clear()}
  >
    <rect
      width={rangeWidth}
      height={rangeHeight}
      class={cls('fill-surface-content/10 cursor-move select-none')}
    />
  </Group>

  <!-- TODO: Add top/bottom handles for `axis="y` | 'both'` -->
  <Group class="handle min" x={rangeLeft} y={rangeTop} on:pointerdown={adjustMin}>
    <rect
      width={handleSize}
      height={rangeHeight}
      class={cls('fill-transparent cursor-ew-resize select-none')}
      on:dblclick={() => (xDomain[0] = xDomainMin)}
    />
  </Group>

  <Group class="handle max" x={right - handleSize + 1} y={0} on:pointerdown={adjustMax}>
    <rect
      width={handleSize}
      height={rangeHeight}
      class={cls('fill-transparent cursor-ew-resize select-none')}
      on:dblclick={() => (xDomain[1] = xDomainMax)}
    />
  </Group>
</g>
