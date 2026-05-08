<script lang="ts" module>
  export type { WaffleProps, WafflePropsWithoutHTML } from './Waffle.shared.svelte.js';
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';

  import Group from '../Group/Group.svelte';
  import Path from '../Path/Path.svelte';
  import Pattern from '../Pattern/Pattern.svelte';

  import { WaffleState, type WaffleProps } from './Waffle.shared.svelte.js';

  let {
    data: dataProp,
    x: xProp,
    y: yProp,
    x1: x1Prop,
    y1: y1Prop,
    axis,
    unit,
    multiple,
    gap,
    round,
    rx,
    ry,
    seriesKey,
    insets,
    width,
    height,
    key = (_, i) => i,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    opacity,
    class: className,
    tooltip,
    onWaffleClick,
    onpointerenter,
    onpointermove,
    onpointerleave,
    onclick,
    symbol,
    ...rest
  }: WaffleProps = $props();

  const c = new WaffleState(
    () =>
      ({
        data: dataProp,
        x: xProp,
        y: yProp,
        x1: x1Prop,
        y1: y1Prop,
        axis,
        unit,
        multiple,
        gap,
        round,
        rx,
        ry,
        seriesKey,
        insets,
        width,
        height,
        fill,
      }) as WaffleProps
  );
</script>

{#each c.items as item (key(item.data, item.index))}
  {@const onItemEnter = (e: PointerEvent) => {
    onpointerenter?.(e as any);
    if (tooltip) c.ctx.tooltip.show(e, item.data);
  }}
  {@const onItemMove = (e: PointerEvent) => {
    onpointermove?.(e as any);
    if (tooltip) c.ctx.tooltip.show(e, item.data);
  }}
  {@const onItemLeave = (e: PointerEvent) => {
    onpointerleave?.(e as any);
    if (tooltip) c.ctx.tooltip.hide();
  }}
  {@const onItemClick = (e: MouseEvent) => {
    onclick?.(e as any);
    onWaffleClick?.(e, { data: item.data });
  }}
  {@const cellInset = c.gap / 2}
  {@const innerWidth = Math.max(0, item.cx - 2 * cellInset)}
  {@const innerHeight = Math.max(0, item.cy - 2 * cellInset)}
  {@const symbolFill = item.fill ?? (typeof fill === 'string' ? fill : undefined) ?? 'currentColor'}
  {#snippet symbolPatternContent()}
    <g transform={`translate(${cellInset},${cellInset})`} fill={symbolFill}>
      {@render symbol?.({
        width: innerWidth,
        height: innerHeight,
        datum: item.data,
        fill: symbolFill,
      })}
    </g>
  {/snippet}
  <Group
    x={item.tx}
    y={item.ty}
    class={cls('lc-waffle', className)}
    opacity={(opacity ?? 1) * c.seriesOpacity}
  >
    <Pattern
      width={item.cx}
      height={item.cy}
      rects={[
        {
          inset: cellInset,
          color: item.fill ?? (typeof fill === 'string' ? fill : undefined),
          opacity: fillOpacity,
          rx,
          ry,
        },
      ]}
      patternContent={symbol ? symbolPatternContent : undefined}
    >
      {#snippet children({ pattern })}
        <Path
          pathData={item.pathData}
          fill={pattern}
          stroke={stroke as string | undefined}
          strokeWidth={strokeWidth as number | undefined}
          class="lc-waffle-cell"
          onpointerenter={onItemEnter}
          onpointermove={onItemMove}
          onpointerleave={onItemLeave}
          onclick={onItemClick}
          {...rest}
        />
      {/snippet}
    </Pattern>
  </Group>
{/each}

<style>
  @layer components {
    :global(:where(.lc-waffle-cell)) {
      --fill-color: var(--color-primary, currentColor);
      --stroke-color: none;
    }
  }
</style>
