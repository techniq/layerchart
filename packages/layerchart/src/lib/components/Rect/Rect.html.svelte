<script lang="ts" module>
  export type { RectProps, RectPropsWithoutHTML } from './Rect.shared.svelte.js';
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { cls } from '@layerstack/tailwind';
  import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
  import { RectState, rectMarkInfo, type RectProps } from './Rect.shared.svelte.js';

  let { children, ...rest }: RectProps = $props();

  const c = new RectState(() => rest as RectProps);

  const htmlRest = $derived(rest as unknown as HTMLAttributes<HTMLDivElement>);

  c.chartCtx.registerComponent({
    name: 'Rect',
    kind: 'mark',
    markInfo: () => rectMarkInfo(rest as RectProps, c.dataMode),
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
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      {...htmlRest}
      style:position="absolute"
      style:left="{item.x}px"
      style:top="{item.y}px"
      style:width="{item.width}px"
      style:height="{item.height}px"
      style:background={resolvedFill}
      style:background-origin="border-box"
      style:opacity={resolvedOpacity}
      style:border-width={resolvedBorderWidth}
      style:border-style={c.dashArrayResolved ? 'dashed' : 'solid'}
      style:border-color={resolvedStroke}
      style:border-radius={c.borderRadius(item.width, item.height) ?? `${c.rx}px`}
      class={cls('lc-rect', resolvedClass)}
    ></div>
  {/each}
{:else}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    {...htmlRest}
    style:position="absolute"
    style:left="{c.motionX}px"
    style:top="{c.motionY}px"
    style:width="{c.motionWidth}px"
    style:height="{c.motionHeight}px"
    style:background={c.staticFill}
    style:background-origin="border-box"
    style:opacity={c.staticOpacity}
    style:border-width={c.staticBorderWidth}
    style:border-style={c.dashArrayResolved ? 'dashed' : 'solid'}
    style:border-color={c.staticStroke}
    style:border-radius={c.borderRadiusStyle ?? `${c.rx}px`}
    class={cls('lc-rect', c.staticClassName)}
  >
    {@render children?.()}
  </div>
{/if}

<style>
  @layer base {
    :global(:where(.lc-rect)) {
      --fill-color: var(--color-surface-content, currentColor);
      --stroke-color: initial;
    }

    /* Html layers */
    :global(:where(.lc-layout-html .lc-rect)) {
      box-sizing: border-box;
    }
    :global(:where(.lc-layout-html .lc-rect):not([background])) {
      background: var(--fill-color);
    }
    :global(:where(.lc-layout-html .lc-rect):not([border-color])) {
      border-color: var(--stroke-color);
    }
  }
</style>
