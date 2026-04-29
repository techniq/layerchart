<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { BarProps } from './Bar.shared.svelte.js';

  export type BarBaseLayerComponents = {
    Rect: Component<any>;
    /**
     * Used only when the chart is radial. Optional because the HTML layer
     * doesn't support radial charts and therefore doesn't need to bundle Arc.
     */
    Arc?: Component<any>;
  };

  export type BarBaseProps = BarProps & BarBaseLayerComponents;
</script>

<script lang="ts">
  import type { PointerEventHandler } from 'svelte/elements';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { BarState } from './Bar.shared.svelte.js';

  let {
    Rect,
    Arc,
    data,
    x: xProp,
    y: yProp,
    x1: x1Prop,
    y1: y1Prop,
    seriesKey,
    stackPadding = 0,
    fill,
    fillOpacity,
    stroke: strokeProp = 'black',
    strokeWidth = 0,
    opacity,
    radius = 0,
    rounded = 'all',
    motion,
    insets,
    initialX,
    initialY,
    initialHeight,
    initialWidth,
    width,
    height,
    tooltip,
    onpointerenter,
    onpointermove,
    onpointerleave,
    ...restProps
  }: BarBaseProps = $props();

  const stroke = $derived(strokeProp === null || strokeProp === undefined ? 'black' : strokeProp);

  const c = new BarState(
    () =>
      ({
        data,
        x: xProp,
        y: yProp,
        x1: x1Prop,
        y1: y1Prop,
        seriesKey,
        stackPadding,
        radius,
        rounded,
        motion,
        insets,
        initialX,
        initialY,
        initialHeight,
        initialWidth,
        width,
        height,
        tooltip,
      }) as BarProps
  );

  const onPointerEnter: PointerEventHandler<Element> = (e) => {
    onpointerenter?.(e);
    if (tooltip) c.ctx.tooltip.show(e, data);
  };

  const onPointerMove: PointerEventHandler<Element> = (e) => {
    onpointermove?.(e);
    if (tooltip) c.ctx.tooltip.show(e, data);
  };

  const onPointerLeave: PointerEventHandler<Element> = (e) => {
    onpointerleave?.(e);
    if (tooltip) c.ctx.tooltip.hide();
  };
</script>

{#if c.ctx.radial && Arc}
  <Arc
    innerRadius={c.dimensions.y}
    outerRadius={c.dimensions.y + c.dimensions.height}
    startAngle={c.dimensions.x}
    endAngle={c.dimensions.x + c.dimensions.width}
    {fill}
    {fillOpacity}
    {stroke}
    {strokeWidth}
    {opacity}
    cornerRadius={radius}
    onpointerenter={onPointerEnter}
    onpointermove={onPointerMove}
    onpointerleave={onPointerLeave}
    {...extractLayerProps(restProps, 'lc-bar')}
  />
{:else}
  <Rect
    {fill}
    {fillOpacity}
    {stroke}
    {strokeWidth}
    {opacity}
    corners={c.corners}
    {motion}
    initialX={c.resolvedInitialX}
    initialY={c.resolvedInitialY}
    initialHeight={c.resolvedInitialHeight}
    initialWidth={c.resolvedInitialWidth}
    {...c.dimensions}
    onpointerenter={onPointerEnter}
    onpointermove={onPointerMove}
    onpointerleave={onPointerLeave}
    {...extractLayerProps(restProps, 'lc-bar')}
  />
{/if}
