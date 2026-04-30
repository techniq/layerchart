<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { ArcProps } from './Arc.shared.svelte.js';

  export type ArcBaseLayerComponents = {
    Path: Component<any>;
  };

  export type ArcBaseProps = ArcProps & ArcBaseLayerComponents;
</script>

<script lang="ts">
  import type { PointerEventHandler, TouchEventHandler } from 'svelte/elements';
  import { cls } from '@layerstack/tailwind';

  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { ArcState } from './Arc.shared.svelte.js';

  let {
    Path,
    ref: refProp = $bindable(),
    trackRef: trackRefProp = $bindable(),
    // Override the `.lc-path` CSS stroke default so arcs don't get a visible outline
    stroke = 'none',
    // Arc-specific config — extracted out of `...restProps` so it doesn't
    // leak onto `<Path>`. `motion` in particular would otherwise make Path
    // also tween the path-string on top of the end-angle tween that
    // `ArcState` already drives, producing visibly wrong arcs.
    motion,
    value,
    initialValue,
    domain,
    range,
    startAngle,
    endAngle,
    innerRadius,
    outerRadius,
    cornerRadius,
    padAngle,
    trackStartAngle,
    trackEndAngle,
    trackInnerRadius,
    trackOuterRadius,
    trackCornerRadius,
    trackPadAngle,
    offset,
    // Pointer / tooltip wiring
    data,
    tooltip,
    track = false,
    onpointerenter = () => {},
    onpointermove = () => {},
    onpointerleave = () => {},
    ontouchmove = () => {},
    children,
    class: className,
    ...restProps
  }: ArcBaseProps = $props();

  const c = new ArcState(
    () =>
      ({
        motion,
        value,
        initialValue,
        domain,
        range,
        startAngle,
        endAngle,
        innerRadius,
        outerRadius,
        cornerRadius,
        padAngle,
        trackStartAngle,
        trackEndAngle,
        trackInnerRadius,
        trackOuterRadius,
        trackCornerRadius,
        trackPadAngle,
        offset,
      }) as ArcProps
  );

  let ref = $state<SVGPathElement>();

  $effect.pre(() => {
    refProp = ref;
  });

  $effect.pre(() => {
    trackRefProp = c.trackRef;
  });

  const onPointerEnter: PointerEventHandler<SVGPathElement> = (e) => {
    onpointerenter?.(e);
    if (tooltip) c.ctx.tooltip.show(e, data);
  };

  const onPointerMove: PointerEventHandler<SVGPathElement> = (e) => {
    onpointermove?.(e);
    if (tooltip) c.ctx.tooltip.show(e, data);
  };

  const onPointerLeave: PointerEventHandler<SVGPathElement> = (e) => {
    onpointerleave?.(e);
    if (tooltip) c.ctx.tooltip.hide();
  };
</script>

{#if track}
  <Path
    pathData={c.trackArc()}
    stroke="none"
    bind:pathRef={() => c.trackRef, (v: SVGPathElement | undefined) => (c.trackRef = v)}
    {...extractLayerProps(track, 'lc-arc-track')}
  />
{/if}

<Path
  bind:pathRef={ref}
  pathData={c.arc()}
  transform="translate({c.xOffset}, {c.yOffset})"
  {stroke}
  {...restProps}
  class={cls('lc-arc-line', className)}
  onpointerenter={onPointerEnter}
  onpointermove={onPointerMove}
  onpointerleave={onPointerLeave}
  ontouchmove={((e) => {
    ontouchmove?.(e);
    if (tooltip) {
      e.preventDefault();
    }
  }) satisfies TouchEventHandler<SVGPathElement>}
/>

{@render children?.({
  centroid: c.trackArcCentroid,
  boundingBox: c.boundingBox,
  value: c.motionEndAngleValue,
  startAngle: c.startAngle,
  endAngle: c.arcEndAngle,
  innerRadius: c.innerRadius,
  outerRadius: c.outerRadius,
  getTrackTextProps: c.getTrackTextProps,
  getArcTextProps: c.getArcTextProps,
})}
