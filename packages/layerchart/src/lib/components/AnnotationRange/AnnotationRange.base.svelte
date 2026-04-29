<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { AnnotationRangeProps } from './AnnotationRange.shared.svelte.js';

  export type AnnotationRangeBaseLayerComponents = {
    LinearGradient: Component<any>;
    Pattern: Component<any>;
    Rect: Component<any>;
    Text: Component<any>;
  };

  export type AnnotationRangeBaseProps = AnnotationRangeProps &
    AnnotationRangeBaseLayerComponents;
</script>

<script lang="ts">
  import { getChartContext } from '$lib/contexts/chart.js';
  import { isScaleBand } from '$lib/utils/scales.svelte.js';
  import { cls } from '@layerstack/tailwind';

  let {
    LinearGradient,
    Pattern,
    Rect,
    Text,
    x,
    y,
    fill,
    class: className,
    gradient,
    pattern,
    label,
    labelPlacement = 'center',
    labelXOffset = 0,
    labelYOffset = 0,
    props,
  }: AnnotationRangeBaseProps = $props();

  const ctx = getChartContext();

  const rect = $derived.by(() => {
    const x0FromScale = x?.[0] != null;
    const x1FromScale = x?.[1] != null;
    const x0 = x0FromScale ? ctx.xScale(x![0]) : ctx.xRange[0];
    const x1 = x1FromScale ? ctx.xScale(x![1]) : ctx.xRange[1];
    const y0 = y?.[0] != null ? ctx.yScale(y[0]) : ctx.yRange[0];
    const y1 = y?.[1] != null ? ctx.yScale(y[1]) : ctx.yRange[1];

    const bandPadding = isScaleBand(ctx.xScale)
      ? (ctx.xScale.padding() * ctx.xScale.step()) / 2
      : 0;
    const bandStep = isScaleBand(ctx.xScale) ? ctx.xScale.step() : 0;

    const leftFromScale = x0 <= x1 ? x0FromScale : x1FromScale;
    const rightFromScale = x0 <= x1 ? x1FromScale : x0FromScale;

    const left = Math.min(x0, x1) - (leftFromScale ? bandPadding : 0);
    const right = Math.max(x0, x1) + (rightFromScale ? bandStep - bandPadding : 0);

    return {
      x: left,
      y: Math.min(y0, y1),
      width: right - left,
      height: Math.abs(y1 - y0),
    };
  });

  const labelProps = $derived({
    x:
      ((labelPlacement.includes('left')
        ? rect.x
        : labelPlacement.includes('right')
          ? (rect.x ?? 0) + rect.width
          : (rect.x ?? 0) + rect.width / 2) ?? 0) +
      (labelPlacement.includes('right') ? -labelXOffset : labelXOffset),
    y:
      ((labelPlacement.includes('top')
        ? rect.y
        : labelPlacement.includes('bottom')
          ? (rect.y ?? 0) + rect.height
          : (rect.y ?? 0) + rect.height / 2) ?? 0) +
      (labelPlacement.includes('bottom') ? -labelYOffset : labelYOffset),
    dy: -2,
    textAnchor: labelPlacement.includes('left')
      ? 'start'
      : labelPlacement.includes('right')
        ? 'end'
        : 'middle',
    verticalAnchor: labelPlacement.includes('top')
      ? 'start'
      : labelPlacement.includes('bottom')
        ? 'end'
        : 'middle',
  });
</script>

{#if fill || className}
  <Rect
    {...rect}
    {...props?.rect}
    {fill}
    class={cls('lc-annotation-range', props?.rect?.class, className)}
  />
{/if}

{#if gradient}
  <LinearGradient {...gradient}>
    {#snippet children({ gradient }: { gradient: string })}
      <Rect {...rect} {...props?.rect} fill={gradient} />
    {/snippet}
  </LinearGradient>
{/if}

{#if pattern}
  <Pattern {...pattern}>
    {#snippet children({ pattern }: { pattern: string })}
      <Rect {...rect} {...props?.rect} fill={pattern} />
    {/snippet}
  </Pattern>
{/if}

{#if label}
  <Text
    value={label}
    {...labelProps}
    {...props?.label}
    class={cls('lc-annotation-range-label', props?.label?.class)}
  />
{/if}

<style>
  @layer components {
    :global(:where(.lc-annotation-range-label)) {
      font-size: 12px;
      pointer-events: none;
    }
  }
</style>
