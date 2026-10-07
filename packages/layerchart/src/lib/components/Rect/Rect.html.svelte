<script lang="ts" module>
  export type { RectProps, RectPropsWithoutHTML } from './Rect.shared.svelte.js';
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { cls } from '@layerstack/tailwind';
  import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
  import type { BoxFace } from '$lib/utils/isometric.js';
  import { RectState, rectMarkInfo, type RectProps } from './Rect.shared.svelte.js';

  let { children, ref: refProp = $bindable(), ...rest }: RectProps = $props();

  let ref = $state<HTMLDivElement>();
  $effect.pre(() => {
    refProp = ref as any;
  });

  const c = new RectState(() => rest as RectProps);

  // `z` and `shade` are read by `RectState`, not HTML attributes
  const htmlRest = $derived.by(() => {
    const { z: _z, shade: _shade, ...attrs } = rest;
    return attrs as unknown as HTMLAttributes<HTMLDivElement>;
  });

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
    {#if item.faces}
      {@render box(item.faces, resolvedFill, resolvedOpacity, resolvedClass)}
    {:else}
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
    {/if}
  {/each}
{:else if c.pixelFaces}
  {@render box(c.pixelFaces, c.staticFill, c.staticOpacity, c.staticClassName)}
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
    bind:this={ref}
  >
    {@render children?.()}
  </div>
{/if}

<!--
  An extruded box: the sides facing the viewer, then the top.  Each face is a 1px square its own
  matrix stretches into place.
-->
{#snippet box(faces: BoxFace[], fill?: string, opacity?: number, className?: string)}
  {#each faces as face}
    {@const [p0, p1, , p3] = face.points}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      {...htmlRest}
      style:position="absolute"
      style:left="0"
      style:top="0"
      style:width="1px"
      style:height="1px"
      style:transform-origin="0 0"
      style:transform="matrix({p1.x - p0.x}, {p1.y - p0.y}, {p3.x - p0.x}, {p3.y - p0.y}, {p0.x},
      {p0.y})"
      style:background={fill}
      style:box-shadow={face.shade ? `inset 0 0 0 9999px rgb(0 0 0 / ${face.shade})` : null}
      style:opacity
      class={cls('lc-rect', `lc-rect-${face.kind}`, className)}
    ></div>
  {/each}
{/snippet}

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
