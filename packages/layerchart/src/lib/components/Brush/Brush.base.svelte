<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { BrushState } from '$lib/states/brush.svelte.js';

  export type BrushProps = {
    /**
     * The selection to drive.  Omit it and one is created, which `bind:state` reads back.
     *
     * @bindable
     */
    state?: BrushState;

    /** Which axis the selection spans.  Only used when creating the state. @default 'x' */
    axis?: 'x' | 'y' | 'both';

    /** The brushable region, defaulting to the plot area */
    x?: number;
    y?: number;
    width?: number;
    height?: number;

    /** Size of the resize handles, in pixels @default 8 */
    handleSize?: number;

    /** Called as the selection changes, and once more when the gesture ends */
    onChange?: (detail: { state: BrushState; phase: 'start' | 'brush' | 'end' }) => void;

    classes?: {
      root?: string;
      selection?: string;
      handle?: string;
    };
  };

  export type BrushBaseProps = BrushProps & { Rect: Component<any> };
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';

  import { getChartContext } from '$lib/contexts/chart.js';
  import { BrushState as BrushStateClass } from '$lib/states/brush.svelte.js';
  import { brushGesture, type BrushMode } from '$lib/attachments/brushable.js';

  let {
    Rect,
    // Aliased so `$state` in this file isn't read as a store subscription of the prop
    state: stateProp = $bindable(),
    axis = 'x',
    x = 0,
    y = 0,
    width,
    height,
    handleSize = 8,
    onChange,
    classes = {},
  }: BrushBaseProps = $props();

  const ctx = getChartContext();

  /** The region element, which every part measures against — a handle is only a few pixels wide */
  let regionEl = $state<Element>();

  function bounds(node: Element) {
    if (regionEl) return regionEl.getBoundingClientRect();

    // Canvas draws its marks, so the node is the layer's own canvas — the region starts inside it
    const rect = node.getBoundingClientRect();
    return {
      left: rect.left + (ctx.padding.left ?? 0) + x,
      top: rect.top + (ctx.padding.top ?? 0) + y,
    };
  }

  // Take the selection given, or own one — either way `bind:state` reads it back
  const brushState = stateProp ?? new BrushStateClass(ctx, { axis });
  stateProp = brushState;

  const region = $derived({
    x,
    y,
    width: width ?? ctx.width,
    height: height ?? ctx.height,
  });

  /**
   * The selection, drawn within the region.
   *
   * `BrushState.range` spans the whole plot on an unbrushed axis, which is right for a chart-wide
   * brush but not for one placed in a band of its own.
   */
  const selection = $derived({
    x: brushState.axis === 'y' ? region.x : brushState.range.x,
    width: brushState.axis === 'y' ? region.width : brushState.range.width,
    y: brushState.axis === 'x' ? region.y : brushState.range.y,
    height: brushState.axis === 'x' ? region.height : brushState.range.height,
  });

  /** The handles this brush carries, each driving its own edge */
  const handles = $derived(
    (
      [
        { edge: 'top', cursor: 'cursor-ns-resize', axis: 'y' },
        { edge: 'bottom', cursor: 'cursor-ns-resize', axis: 'y' },
        { edge: 'left', cursor: 'cursor-ew-resize', axis: 'x' },
        { edge: 'right', cursor: 'cursor-ew-resize', axis: 'x' },
      ] as const
    ).filter((h) => brushState.axis === 'both' || brushState.axis === h.axis)
  );

  /**
   * The props that make one part of the brush take a drag.
   *
   * A handler rather than the `brushable` attachment, since a canvas layer draws its marks rather
   * than creating elements for them — it hit-tests the pointer and calls what the mark registered.
   */
  function part(mode?: BrushMode) {
    return {
      onpointerdown: brushGesture({
        state: brushState,
        mode,
        bounds,
        // Wrapped rather than passed, so a changed `onChange` prop is still picked up
        onChange: (detail) => onChange?.(detail),
      }),
    };
  }

  const parts = {
    root: part(),
    move: part('move'),
    top: part('top'),
    bottom: part('bottom'),
    left: part('left'),
    right: part('right'),
  };

  function handleRect(edge: 'top' | 'bottom' | 'left' | 'right') {
    const { x: sx, y: sy, width: sw, height: sh } = selection;
    switch (edge) {
      case 'top':
        return { x: sx, y: sy - handleSize / 2, width: sw, height: handleSize };
      case 'bottom':
        return { x: sx, y: sy + sh - handleSize / 2, width: sw, height: handleSize };
      case 'left':
        return { x: sx - handleSize / 2, y: sy, width: handleSize, height: sh };
      case 'right':
        return { x: sx + sw - handleSize / 2, y: sy, width: handleSize, height: sh };
    }
  }
</script>

<!--
  The region that starts a new selection.  Drawn first so the selection and its handles sit above
  it and take their own drags.
-->
<Rect
  {...region}
  {...parts.root}
  bind:ref={regionEl}
  class={cls('lc-brush-root fill-transparent cursor-crosshair', classes.root)}
/>

{#if brushState.active}
  <Rect
    {...selection}
    {...parts.move}
    class={cls('lc-brush-selection cursor-move', classes.selection)}
  />

  <!-- A rect per edge rather than one hit-tested region, so each carries its own resize cursor -->
  {#each handles as handle (handle.edge)}
    <Rect
      {...handleRect(handle.edge)}
      {...parts[handle.edge]}
      class={cls('lc-brush-handle', handle.cursor, classes.handle)}
    />
  {/each}
{/if}

<style>
  @layer components {
    :global(:where(.lc-brush-selection)) {
      fill: color-mix(in oklab, var(--color-surface-content, currentColor) 10%, transparent);
    }

    :global(:where(.lc-brush-handle)) {
      fill: transparent;
    }

    /*
      An html layer draws each rect as a `div`, which takes a background rather than a fill — and
      one by default, so the region and handles have to clear it.  These win over `Rect`'s own
      defaults by layer rather than specificity, leaving a passed `class` free to override them.
    */
    :global(:where(.lc-layout-html .lc-brush-root)),
    :global(:where(.lc-layout-html .lc-brush-handle)) {
      background: transparent;
    }

    :global(:where(.lc-layout-html .lc-brush-selection)) {
      background: color-mix(in oklab, var(--color-surface-content, currentColor) 10%, transparent);
    }
  }
</style>
