<script lang="ts" module>
  export type {
    CircleProps,
    CirclePropsWithoutHTML,
  } from './Circle.shared.svelte.js';
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
  import {
    CircleState,
    circleMarkInfo,
    type CircleProps,
  } from './Circle.shared.svelte.js';

  let {
    children,
    ...rest
  }: CircleProps = $props();

  const c = new CircleState(() => rest as CircleProps);

  // HTML-only: derive a border-width that mimics SVG's implicit `stroke-width: 1`
  // when `stroke` is set but `strokeWidth` is not.
  const staticBorderWidth = $derived(
    typeof rest.strokeWidth === 'number'
      ? `${rest.strokeWidth}px`
      : typeof rest.stroke === 'string'
        ? '1px'
        : undefined
  );

  c.chartCtx.registerComponent({
    name: 'Circle',
    kind: 'mark',
    markInfo: () => circleMarkInfo(rest as CircleProps, c.dataMode),
  });
</script>

{#if c.dataMode}
  {#each c.resolvedItems as item (item.key)}
    {@const resolvedFill = resolveColorProp(rest.fill, item.d, c.chartCtx.cScale)}
    {@const resolvedStroke = resolveColorProp(rest.stroke, item.d, c.chartCtx.cScale)}
    {@const resolvedStrokeWidth = resolveStyleProp(rest.strokeWidth, item.d)}
    {@const resolvedOpacity = resolveStyleProp(rest.opacity, item.d)}
    {@const resolvedClass = resolveStyleProp(rest.class, item.d)}
    {@const resolvedBorderWidth =
      resolvedStrokeWidth != null
        ? `${resolvedStrokeWidth}px`
        : resolvedStroke != null
          ? '1px'
          : undefined}
    <div
      {...rest as any}
      style:position="absolute"
      style:left="{item.cx}px"
      style:top="{item.cy}px"
      style:width="{item.r * 2}px"
      style:height="{item.r * 2}px"
      style:border-radius="50%"
      style:background={resolvedFill}
      style:background-origin="border-box"
      style:opacity={resolvedOpacity}
      style:border-width={resolvedBorderWidth}
      style:border-color={resolvedStroke}
      style:border-style={c.dashArrayResolved ? 'dashed' : 'solid'}
      style:transform="translate(-50%, -50%)"
      class={cls('lc-circle', resolvedClass)}
    ></div>
  {/each}
{:else}
  <div
    {...rest as any}
    style:position="absolute"
    style:left="{c.motionCx}px"
    style:top="{c.motionCy}px"
    style:width="{c.motionR * 2}px"
    style:height="{c.motionR * 2}px"
    style:border-radius="50%"
    style:background={c.staticFill}
    style:background-origin="border-box"
    style:opacity={c.staticOpacity}
    style:border-width={staticBorderWidth}
    style:border-color={c.staticStroke}
    style:border-style={c.dashArrayResolved ? 'dashed' : 'solid'}
    style:transform="translate(-50%, -50%)"
    class={cls('lc-circle', c.staticClassName)}
  >
    {@render children?.()}
  </div>
{/if}

<style>
  @layer base {
    :global(:where(.lc-circle)) {
      --fill-color: var(--color-surface-content, currentColor);
      --stroke-color: initial;
    }

    /* Html layers */
    :global(:where(.lc-layout-html .lc-circle)) {
      /* Match SVG sizing (visual extent equals `r * 2`, border on outer edge) */
      box-sizing: border-box;
    }
    :global(:where(.lc-layout-html .lc-circle):not([background])) {
      background: var(--fill-color);
    }
    :global(:where(.lc-layout-html .lc-circle):not([border-color])) {
      border-color: var(--stroke-color);
    }
  }
</style>
