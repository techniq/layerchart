<script lang="ts" module>
  export type {
    TextProps,
    TextPropsWithoutHTML,
    TextSegment,
  } from './Text.shared.svelte.js';
</script>

<script lang="ts">
  import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
  import { getPixelValue, TextState, textMarkInfo, type TextProps } from './Text.shared.svelte.js';

  let { ...rest }: TextProps = $props();

  const c = new TextState(() => rest as TextProps);

  c.chartCtx.registerComponent({
    name: 'Text',
    kind: 'mark',
    markInfo: () => textMarkInfo(rest as TextProps, c.dataMode),
  });
</script>

{#if c.dataMode}
  {#each c.resolvedItems as item (item.key)}
    {@const text = c.resolveTextValue(item.d)}
    {@const resolvedFill = resolveColorProp(rest.fill, item.d, c.chartCtx.cScale)}
    {@const resolvedFillOpacity = resolveStyleProp(rest.fillOpacity, item.d)}
    {@const resolvedOpacity = resolveStyleProp(rest.opacity, item.d)}
    {@const resolvedClass = resolveStyleProp(rest.class, item.d)}
    {@const textAnchor = rest.textAnchor ?? 'start'}
    {@const verticalAnchor = rest.verticalAnchor ?? 'end'}
    {@const translateX = textAnchor === 'middle' ? '-50%' : textAnchor === 'end' ? '-100%' : '0%'}
    {@const translateY =
      verticalAnchor === 'middle' ? '-50%' : verticalAnchor === 'end' ? '-100%' : '0%'}
    <div
      style:position="absolute"
      style:left="{getPixelValue(rest.dx ?? 0) + item.x}px"
      style:top="{getPixelValue(rest.dy ?? 0) + item.y}px"
      style:transform="translate({translateX}, {translateY}) rotate({rest.rotate ?? 0}deg)"
      style:transform-origin="{verticalAnchor === 'middle'
        ? 'center'
        : verticalAnchor === 'end'
          ? 'bottom'
          : 'top'}
      {textAnchor === 'middle' ? 'center' : textAnchor === 'end' ? 'right' : 'left'}"
      style:white-space="pre-wrap"
      style:line-height={rest.lineHeight ?? '1em'}
      style:font-size={typeof rest.fontSize === 'number'
        ? `${rest.fontSize}px`
        : rest.fontSize}
      style:color={resolvedFill}
      style:opacity={resolvedOpacity ?? resolvedFillOpacity}
      class={['lc-text', resolvedClass]}
    >
      {text}
    </div>
  {/each}
{:else}
  {@const textAnchor = rest.textAnchor ?? 'start'}
  {@const verticalAnchor = rest.verticalAnchor ?? 'end'}
  {@const translateX = textAnchor === 'middle' ? '-50%' : textAnchor === 'end' ? '-100%' : '0%'}
  {@const translateY =
    verticalAnchor === 'middle' ? '-50%' : verticalAnchor === 'end' ? '-100%' : '0%'}
  <div
    style:position="absolute"
    style:left="{(typeof rest.dx === 'number' ? rest.dx : 0) +
      (typeof c.motionX === 'number' ? c.motionX : 0)}px"
    style:top="{(typeof rest.dy === 'number' ? rest.dy : 0) +
      (typeof c.motionY === 'number' ? c.motionY : 0)}px"
    style:transform="translate({translateX}, {translateY}) rotate({rest.rotate ?? 0}deg)"
    style:transform-origin="{verticalAnchor === 'middle'
      ? 'center'
      : verticalAnchor === 'end'
        ? 'bottom'
        : 'top'}
    {textAnchor === 'middle' ? 'center' : textAnchor === 'end' ? 'right' : 'left'}"
    style:white-space="pre-wrap"
    style:line-height={rest.lineHeight ?? '1em'}
    style:font-size={typeof rest.fontSize === 'number'
      ? `${rest.fontSize}px`
      : rest.fontSize}
    style:color={c.staticFill}
    style:opacity={c.staticOpacity ?? c.staticFillOpacity}
    class={['lc-text', c.staticClassName]}
  >
    {#if rest.segments}
      {#each rest.segments as segment}
        <span class={segment.class}>{segment.value}</span>
      {/each}
    {:else}
      {c.textValue}
    {/if}
  </div>
{/if}

<style>
  @layer base {
    :global(:where(.lc-text)) {
      --fill-color: var(--color-surface-content, currentColor);
      --stroke-color: initial;
    }

    /* Html layers */
    :global(:where(.lc-layout-html .lc-text):not([background-color])) {
      color: var(--fill-color);
    }
    :global(:where(.lc-layout-html .lc-text):not([border-color])) {
      border-color: var(--stroke-color);
    }
  }
</style>
