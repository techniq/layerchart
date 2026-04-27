<script lang="ts" module>
  export type {
    EllipseProps,
    EllipsePropsWithoutHTML,
  } from './Ellipse.shared.svelte.js';
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
  import { EllipseState, ellipseMarkInfo, type EllipseProps } from './Ellipse.shared.svelte.js';

  let { ...rest }: EllipseProps = $props();

  const c = new EllipseState(() => rest as EllipseProps);

  c.chartCtx.registerComponent({
    name: 'Ellipse',
    kind: 'mark',
    markInfo: () => ellipseMarkInfo(rest as EllipseProps, c.dataMode),
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
      style:width="{item.rx * 2}px"
      style:height="{item.ry * 2}px"
      style:border-radius="50%"
      style:background={resolvedFill}
      style:background-origin="border-box"
      style:opacity={resolvedOpacity}
      style:border-width={resolvedBorderWidth}
      style:border-color={resolvedStroke}
      style:border-style="solid"
      style:transform="translate(-50%, -50%)"
      class={cls('lc-ellipse', resolvedClass)}
    ></div>
  {/each}
{:else}
  <div
    {...rest as any}
    style:position="absolute"
    style:left="{c.motionCx}px"
    style:top="{c.motionCy}px"
    style:width="{c.motionRx * 2}px"
    style:height="{c.motionRy * 2}px"
    style:border-radius="50%"
    style:background={c.staticFill}
    style:background-origin="border-box"
    style:opacity={c.staticOpacity}
    style:border-width={c.staticBorderWidth}
    style:border-color={c.staticStroke}
    style:border-style="solid"
    style:transform="translate(-50%, -50%)"
    class={cls('lc-ellipse', c.staticClassName)}
  ></div>
{/if}

<style>
  @layer base {
    :global(:where(.lc-ellipse)) {
      --fill-color: var(--color-surface-content, currentColor);
      --stroke-color: initial;
    }

    :global(:where(.lc-layout-html .lc-ellipse)) {
      box-sizing: border-box;
    }
    :global(:where(.lc-layout-html .lc-ellipse):not([background])) {
      background: var(--fill-color);
    }
    :global(:where(.lc-layout-html .lc-ellipse):not([border-color])) {
      border-color: var(--stroke-color);
    }
  }
</style>
