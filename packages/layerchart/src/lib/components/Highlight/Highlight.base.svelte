<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { HighlightProps } from './Highlight.shared.svelte.js';

  /**
   * Per-layer primitives a `<Highlight.base>` consumer must inject.
   * `Arc` is only used for radial `area`; per-layer wrappers can pass the
   * agnostic Arc until Arc is split.
   */
  export type HighlightBaseLayerComponents = {
    Circle: Component<any>;
    Line: Component<any>;
    Rect: Component<any>;
    Arc: Component<any>;
  };

  export type HighlightBaseProps = HighlightProps & HighlightBaseLayerComponents;
</script>

<script lang="ts">
  import { asAny } from '$lib/utils/types.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  import { HighlightState } from './Highlight.shared.svelte.js';

  let {
    Circle,
    Line,
    Rect,
    Arc,
    points = false,
    lines: linesProp = false,
    area = false,
    bar = false,
    opacity,
    motion = 'spring',
    onAreaClick,
    onBarClick,
    onPointClick,
    onPointEnter,
    onPointLeave,
    ...rest
  }: HighlightBaseProps = $props();

  const c = new HighlightState(
    () =>
      ({
        ...rest,
        points,
        lines: linesProp,
        area,
        bar,
        opacity,
        motion,
      }) as HighlightProps
  );
</script>

{#if c.highlightData}
  {#if area}
    {#if typeof area === 'function'}
      {@render area({ area: c.area })}
    {:else if c.ctx.radial}
      <Arc
        motion={motion === 'spring' ? 'spring' : undefined}
        startAngle={c.area.x}
        endAngle={c.area.x + c.area.width}
        innerRadius={c.area.y}
        outerRadius={c.area.y + c.area.height}
        {opacity}
        class="lc-highlight-area"
        onclick={onAreaClick && ((e: MouseEvent) => onAreaClick(e, { data: c.highlightData }))}
      />
    {:else}
      <Rect
        motion={motion === 'spring' ? 'spring' : undefined}
        {opacity}
        {...c.area}
        {...extractLayerProps(area, 'lc-highlight-area')}
        onclick={onAreaClick && ((e: MouseEvent) => onAreaClick(e, { data: c.highlightData }))}
      />
    {/if}
  {/if}

  {#if bar}
    {#if typeof bar === 'function'}
      {@render bar()}
    {:else}
      {#await import('../Bar/Bar.svelte') then { default: Bar }}
        <Bar
          motion={motion === 'spring' ? 'spring' : undefined}
          data={c.highlightData}
          {opacity}
          {...extractLayerProps(bar, 'lc-highlight-bar')}
          onclick={onBarClick && ((e: MouseEvent) => onBarClick(e, { data: c.highlightData }))}
        />
      {/await}
    {/if}
  {/if}

  {#if linesProp}
    {#if typeof linesProp === 'function'}
      {@render linesProp({ lines: c.lines })}
    {:else}
      {#each c.lines as line}
        <Line
          motion={motion === 'spring' ? 'spring' : undefined}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          dashArray={[2, 2]}
          {opacity}
          {...extractLayerProps(linesProp, 'lc-highlight-line')}
        />
      {/each}
    {/if}
  {/if}

  {#if points}
    {#if typeof points === 'function'}
      {@render points({ points: c.points })}
    {:else}
      {#each c.points as point}
        {@const pointOpacity =
          opacity ??
          (point.seriesKey
            ? c.ctx.series.isHighlighted(point.seriesKey, true)
              ? 1
              : 0.1
            : undefined)}
        <Circle
          motion={motion === 'spring' ? 'spring' : undefined}
          cx={point.x}
          cy={point.y}
          fill={point.fill}
          r={point.r ?? 4}
          strokeWidth={point.r ? 2 : 6}
          opacity={pointOpacity}
          {...extractLayerProps(points, 'lc-highlight-point')}
          onpointerdown={onPointClick &&
            ((e: PointerEvent) => {
              e.stopPropagation();
            })}
          onclick={onPointClick &&
            ((e: MouseEvent) => onPointClick(e, { point, data: c.highlightData }))}
          onpointerenter={(e: PointerEvent) => {
            if (onPointClick) {
              asAny(e.target).style.cursor = 'pointer';
            }
            if (point.seriesKey) {
              c.ctx.series.highlightKey = point.seriesKey;
            }
            onPointEnter?.(e, { point, data: c.highlightData });
          }}
          onpointerleave={(e: PointerEvent) => {
            if (onPointClick) {
              asAny(e.target).style.cursor = 'default';
            }
            if (point.seriesKey) {
              c.ctx.series.highlightKey = null;
            }
            onPointLeave?.(e, { point, data: c.highlightData });
          }}
        />
      {/each}
    {/if}
  {/if}
{/if}

<style>
  @layer components {
    :global(:where(.lc-highlight-area)) {
      --fill-color: color-mix(in oklab, var(--color-surface-content, currentColor) 5%, transparent);
    }

    :global(:where(.lc-highlight-bar)) {
      --fill-color: var(--color-primary, currentColor);
    }

    :global(:where(.lc-highlight-line)) {
      --stroke-color: color-mix(
        in oklab,
        var(--color-surface-content, currentColor) 20%,
        transparent
      );
      stroke-width: 2;
      stroke-dasharray: 2 2;
      pointer-events: none;
    }

    :global(:where(.lc-highlight-point)) {
      --stroke-color: white;
      --fill-color: var(--color-primary, currentColor);
      paint-order: stroke;
      filter: drop-shadow(var(--drop-shadow-sm, 0 1px 2px rgb(0 0 0 / 0.15)));
    }
  }
</style>
