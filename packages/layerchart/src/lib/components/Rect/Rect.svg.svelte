<script lang="ts" module>
  export type { RectProps, RectPropsWithoutHTML } from './Rect.shared.svelte.js';
</script>

<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements';
  import { cls } from '@layerstack/tailwind';
  import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
  import { RectState, rectMarkInfo, type RectProps } from './Rect.shared.svelte.js';

  let {
    ref: refProp = $bindable(),
    // Pull out props that collide with `<rect>` SVG attribute names so
    // `{...rest}` spread doesn't override our explicit values.
    x,
    y,
    width,
    height,
    rx: rxProp,
    ry: ryProp,
    children,
    ...rest
  }: RectProps = $props();

  const c = new RectState(
    () =>
      ({
        x,
        y,
        width,
        height,
        rx: rxProp,
        ry: ryProp,
        ...rest,
      }) as RectProps
  );

  let ref = $state<SVGRectElement>();

  $effect.pre(() => {
    refProp = ref;
  });

  c.chartCtx.registerComponent({
    name: 'Rect',
    kind: 'mark',
    markInfo: () =>
      rectMarkInfo(
        { x, y, width, height, rx: rxProp, ry: ryProp, ...rest } as RectProps,
        c.dataMode
      ),
  });
</script>

{#if c.dataMode}
  {#each c.resolvedItems as item (item.key)}
    {@const resolvedFill = resolveColorProp(rest.fill, item.d, c.chartCtx.cScale)}
    {@const resolvedStroke = resolveColorProp(rest.stroke, item.d, c.chartCtx.cScale)}
    {@const resolvedFillOpacity = resolveStyleProp(rest.fillOpacity, item.d)}
    {@const resolvedStrokeOpacity = resolveStyleProp(rest.strokeOpacity, item.d)}
    {@const resolvedStrokeWidth = resolveStyleProp(rest.strokeWidth, item.d)}
    {@const resolvedOpacity = resolveStyleProp(rest.opacity, item.d)}
    {@const resolvedClass = resolveStyleProp(rest.class, item.d)}
    {@const pathData = c.roundedRectPath(item.x, item.y, item.width, item.height)}
    {#if pathData}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <path
        {...rest as unknown as SVGAttributes<SVGPathElement>}
        d={pathData}
        fill={resolvedFill}
        fill-opacity={resolvedFillOpacity}
        stroke={resolvedStroke}
        stroke-opacity={resolvedStrokeOpacity}
        stroke-width={resolvedStrokeWidth}
        opacity={resolvedOpacity}
        stroke-dasharray={c.dashArrayAttr}
        class={cls('lc-rect', resolvedClass)}
      />
    {:else}
      <rect
        {...rest as any}
        x={item.x}
        y={item.y}
        width={item.width}
        height={item.height}
        fill={resolvedFill}
        fill-opacity={resolvedFillOpacity}
        stroke={resolvedStroke}
        stroke-opacity={resolvedStrokeOpacity}
        stroke-width={resolvedStrokeWidth}
        opacity={resolvedOpacity}
        rx={c.rx}
        ry={c.ry}
        stroke-dasharray={c.dashArrayAttr}
        class={cls('lc-rect', resolvedClass)}
      />
    {/if}
  {/each}
{:else if c.pixelPathData}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <path
    {...rest as unknown as SVGAttributes<SVGPathElement>}
    d={c.pixelPathData}
    fill={c.staticFill}
    fill-opacity={c.staticFillOpacity}
    stroke={c.staticStroke}
    stroke-opacity={c.staticStrokeOpacity}
    stroke-width={c.staticStrokeWidth}
    opacity={c.staticOpacity}
    stroke-dasharray={c.dashArrayAttr}
    class={cls('lc-rect', c.staticClassName)}
  />
{:else}
  <rect
    {...rest as any}
    x={c.motionX}
    y={c.motionY}
    width={c.motionWidth}
    height={c.motionHeight}
    fill={c.staticFill}
    fill-opacity={c.staticFillOpacity}
    stroke={c.staticStroke}
    stroke-opacity={c.staticStrokeOpacity}
    stroke-width={c.staticStrokeWidth}
    opacity={c.staticOpacity}
    rx={c.rx}
    ry={c.ry}
    stroke-dasharray={c.dashArrayAttr}
    class={cls('lc-rect', c.staticClassName)}
    bind:this={ref}
  />
{/if}

<style>
  @layer base {
    :global(:where(.lc-rect)) {
      --fill-color: var(--color-surface-content, currentColor);
      --stroke-color: initial;
    }

    /* Svg | Canvas layers */
    :global(:where(.lc-layout-svg .lc-rect, svg.lc-rect):not([fill])) {
      fill: var(--fill-color);
    }
    :global(:where(.lc-layout-svg .lc-rect, svg.lc-rect):not([stroke])) {
      stroke: var(--stroke-color);
    }
  }
</style>
