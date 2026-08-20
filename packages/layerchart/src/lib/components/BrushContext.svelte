<script lang="ts" module>
  import type { Snippet } from 'svelte';

  import {
    BrushState,
    type BrushDomainType,
    type BrushExtent,
    type BrushSelection,
  } from '$lib/states/brush.svelte.js';

  type BrushEventPayload = {
    brush: BrushState;
  };

  type BrushContextPropsWithoutHTML = {
    /**
     * The axis to apply brushing
     *
     * @default 'x'
     */
    axis?: 'x' | 'y' | 'both';

    /**
     * Size of the draggable handles (width/height)
     *
     * @default 5
     */
    handleSize?: number;

    /**
     * Whether clicking on the empty area resets the brush.
     *
     * @default true
     */
    clickToReset?: boolean;

    /**
     * External x domain to sync the brush to.
     * When provided, the brush reactively updates to reflect this value.
     */
    x?: BrushDomainType;

    /**
     * External y domain to sync the brush to.
     * When provided, the brush reactively updates to reflect this value.
     */
    y?: BrushDomainType;

    /**
     * Minimum selection size per axis. In domain units for continuous scales (e.g. milliseconds
     * for time scales), or number of categories for band/point scales.
     */
    minExtent?: BrushExtent;

    /**
     * Maximum selection size per axis, e.g. `{ x: 30 * 24 * 60 * 60 * 1000 }` to cap a time-scale
     * brush at 30 days. In domain units for continuous scales, or number of categories for band scales.
     */
    maxExtent?: BrushExtent;

    /**
     * Custom constraint function, called after `min/maxExtent` on every selection update. Receives
     * the candidate `{ x, y }` domain selection and returns a corrected one (e.g. snapping edges to
     * boundaries). Mirrors `TransformContext`'s `constrain`.
     */
    constrain?: (selection: BrushSelection) => BrushSelection;

    /**
     * Keep the selection within the domain extent. Pointer gestures already clamp to the domain;
     * this additionally clamps `constrain` output (e.g. a snap that rounds past the first/last
     * value). Set `false` to allow `constrain` to place edges outside the domain.
     *
     * @default true
     */
    constrainToDomain?: boolean;

    /**
     * Disable brush
     *
     * @default false
     */
    disabled?: boolean;

    /**
     * Attributes passed to the range <div> element
     */
    range?: Partial<HTMLAttributes<HTMLElement>>;

    /**
     * Attributes passed to the handle <div> elements
     */
    handle?: Partial<HTMLAttributes<HTMLElement>>;

    /**
     * Classes to apply to the various elements rendered
     *
     * @default {}
     */
    classes?: {
      root?: string;
      frame?: string;
      range?: string;
      handle?: string;
      labels?: string;
    };

    onBrushStart?: (detail: BrushEventPayload) => void;
    onChange?: (detail: BrushEventPayload) => void;
    onBrushEnd?: (detail: BrushEventPayload) => void;

    /**
     * A reference to this brush's state for use in parent components.
     *
     * @bindable
     */
    state?: BrushState;

    children?: Snippet<[{ state: BrushState }]>;
  };
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { brushable, type BrushMode } from '$lib/attachments/brushable.js';
  import { cls } from '@layerstack/tailwind';
  import { Logger } from '@layerstack/utils';

  import type { HTMLAttributes } from 'svelte/elements';
  import { getChartContext } from '$lib/contexts/chart.js';

  const ctx = getChartContext();

  let {
    x,
    y,
    state: stateProp = $bindable(),

    axis = 'x',
    handleSize = 5,
    clickToReset = true,
    disabled = false,
    minExtent,
    maxExtent,
    constrain,
    constrainToDomain = true,
    range = {},
    handle = {},
    classes = {},
    onBrushEnd = () => {},
    onBrushStart = () => {},
    onChange = () => {},
    children,
  }: BrushContextPropsWithoutHTML = $props();

  let rootEl = $state<HTMLElement>();

  const brushState = new BrushState(ctx, {
    x,
    y,
    axis,
    minExtent,
    maxExtent,
    constrain,
    constrainToDomain,
  });
  stateProp = brushState;

  $effect(() => {
    brushState.handleSize = handleSize;
  });

  // Keep constraint config in sync when props change reactively
  $effect(() => {
    brushState.minExtent = minExtent;
    brushState.maxExtent = maxExtent;
    brushState.constrain = constrain;
    brushState.constrainToDomain = constrainToDomain;
  });

  const logger = new Logger('BrushContext');
  const RESET_THRESHOLD = 1; // size of pointer delta to ignore

  /**
   * The gesture, from the `brushable` attachment — the same one a chart can attach to elements of
   * its own.  Each part of the brush takes the mode it represents, so the handles keep their own
   * cursors and hit areas, and the root creates a new selection.
   */
  function gesture(mode: BrushMode) {
    return brushable({
      state: brushState,
      axis,
      mode,
      // Every part measures against the root, not against itself — a handle is only a few pixels
      bounds: () => rootEl?.getBoundingClientRect(),
      // The gesture belongs to the panel it started in, and stays there — the scales are shared,
      // so the selection it produces applies to every panel.  Unfaceted charts resolve to the
      // single full-size panel, and a point in the gap between panels to none, which ignores it.
      origin: (offset) => {
        const panel = ctx.facet.panelAt(offset.x, offset.y);
        if (!panel) {
          logger.debug('ignoring drag as outside of chart bounds', { offset });
          return null;
        }
        return { x: panel.x, y: panel.y };
      },
      clearThreshold: clickToReset ? RESET_THRESHOLD : 0,
      onChange: ({ phase }) => {
        if (phase === 'start') onBrushStart({ brush: brushState });
        else if (phase === 'brush') onChange({ brush: brushState });
        else onBrushEnd({ brush: brushState });
      },
    });
  }

  // Sync external x/y props into brush state when provided
  $effect.pre(() => {
    if (x !== undefined || y !== undefined) {
      const extX = x;
      const extY = y;
      // Avoid tracking brushState internals to prevent reactive loops
      untrack(() => brushState.syncFromExternal(extX, extY));
    }
  });
</script>

{#if disabled}
  {@render children?.({ state: brushState })}
{:else}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    bind:this={rootEl}
    style:top="{ctx.padding.top}px"
    style:left="{ctx.padding.left}px"
    style:width="{ctx.box.width}px"
    style:height="{ctx.box.height}px"
    class={cls('lc-brush-context')}
    {@attach gesture('create')}
    ondblclick={(e) => {
      brushState.selectAll();
      e.stopPropagation();
    }}
  >
    <div
      class={cls('lc-brush-container')}
      style:top="-{ctx.padding.top ?? 0}px"
      style:left="-{ctx.padding.left ?? 0}px"
      style:width="{ctx.containerWidth}px"
      style:height="{ctx.containerHeight}px"
    >
      {@render children?.({ state: brushState })}
    </div>

    {#if brushState.active}
      <!--
        One selection, drawn in every panel — the panels share the position scales, so a range
        of the domain is the same range in each of them.
      -->
      {#each ctx.facet.panels as panel (panel.key)}
        <div class="lc-brush-panel" style:left="{panel.x}px" style:top="{panel.y}px">
          <div
            {...range}
            style:left="{brushState.range.x}px"
            style:top="{brushState.range.y}px"
            style:width="{brushState.range.width}px"
            style:height="{brushState.range.height}px"
            class={cls('lc-brush-range', classes.range, range?.class)}
            {@attach gesture('move')}
            ondblclick={(e) => {
              // Stopped as the handles do — the root takes a double-click as "select all", which
              // would otherwise land right back on top of the selection just cleared
              e.stopPropagation();
              brushState.reset();
              onChange({ brush: brushState });
            }}
          ></div>

          {#if axis === 'both' || axis === 'y'}
            <div
              {...handle}
              style:left="{brushState.range.x}px"
              style:top="{brushState.range.y}px"
              style:width="{brushState.range.width}px"
              style:height="{handleSize}px"
              data-position="top"
              class={cls('lc-brush-handle', classes.handle, handle?.class)}
              {@attach gesture('top')}
              ondblclick={(e) => {
                e.stopPropagation();
                if (brushState.y[0]) {
                  brushState.y[0] = brushState.yDomainMin;
                  onChange({ brush: brushState });
                }
              }}
            ></div>

            <div
              {...handle}
              style:left="{brushState.range.x}px"
              style:top="{brushState.range.y + brushState.range.height - handleSize}px"
              style:width="{brushState.range.width}px"
              style:height="{handleSize}px"
              data-position="bottom"
              class={cls('lc-brush-handle', classes.handle, handle?.class)}
              {@attach gesture('bottom')}
              ondblclick={(e) => {
                e.stopPropagation();
                if (brushState.y[1]) {
                  brushState.y[1] = brushState.yDomainMax;
                  onChange({ brush: brushState });
                }
              }}
            ></div>
          {/if}

          {#if axis === 'both' || axis === 'x'}
            <div
              {...handle}
              style:left="{brushState.range.x}px"
              style:top="{brushState.range.y}px"
              style:width="{handleSize}px"
              style:height="{brushState.range.height}px"
              data-position="left"
              class={cls('lc-brush-handle', classes.handle, handle?.class)}
              {@attach gesture('left')}
              ondblclick={(e) => {
                e.stopPropagation();
                if (brushState.x[0]) {
                  brushState.x[0] = brushState.xDomainMin;
                  onChange({ brush: brushState });
                }
              }}
            ></div>

            <div
              {...handle}
              style:left="{brushState.range.x + brushState.range.width - handleSize + 1}px"
              style:top="{brushState.range.y}px"
              style:width="{handleSize}px"
              style:height="{brushState.range.height}px"
              data-position="right"
              class={cls('lc-brush-handle', classes.handle, handle?.class)}
              {@attach gesture('right')}
              ondblclick={(e) => {
                e.stopPropagation();
                if (brushState.x[1]) {
                  brushState.x[1] = brushState.xDomainMax;
                  onChange({ brush: brushState });
                }
              }}
            ></div>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
{/if}

<style>
  @layer base {
    :where(.lc-brush-context) {
      position: absolute;
      touch-action: none;
    }

    :where(.lc-brush-container) {
      position: absolute;
    }

    :where(.lc-brush-panel) {
      position: absolute;
    }

    :where(.lc-brush-range) {
      position: absolute;
      cursor: move;
      user-select: none;
      z-index: 10;
      background: color-mix(in oklab, var(--color-surface-content, currentColor) 10%, transparent);
    }

    :where(.lc-brush-handle) {
      position: absolute;
      user-select: none;
      z-index: 10;

      &[data-position='top'],
      &[data-position='bottom'] {
        cursor: ns-resize;
      }

      &[data-position='left'],
      &[data-position='right'] {
        cursor: ew-resize;
      }
    }
  }
</style>
