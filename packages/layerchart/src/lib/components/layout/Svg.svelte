<script lang="ts">
  import { cls } from '@layerstack/tailwind';

  import { chartContext } from '../ChartContext.svelte';
  import { transformContext } from '../TransformContext.svelte';

  /** The layer's `<svg>` tag. Useful for bindings. */
  export let element: SVGElement | undefined = undefined;

  /** The layer's `<g>` tag. Useful for bindings. */
  export let innerElement: SVGGElement | undefined = undefined;

  /** The layer's z-index. */
  export let zIndex = undefined;

  /** Set this to `false` to set `pointer-events: none;` on the entire layer. */
  export let pointerEvents: boolean | undefined = undefined;

  /** A string passed to the `viewBox` property on the `<svg>` tag. */
  export let viewBox: string | undefined = undefined;

  /** A string passed to the `aria-label` property on the `<svg>` tag. */
  export let label: string | undefined = undefined;

  /** A string passed to the `aria-labelledby property` on the `<svg>` tag. */
  export let labelledBy: string | undefined = undefined;

  /** A string passed to the `aria-describedby` property on the `<svg>` tag. */
  export let describedBy: string | undefined = undefined;

  /** Shorthand to set the contents of `<title></title>` for accessibility. You can also set arbitrary HTML via the "title" slot but this is a convenient shorthand. If you use the "title" slot, this prop is ignored. */
  export let title: string | undefined = undefined;

  const { containerWidth, containerHeight, width, height, padding } = chartContext();

  const { mode, scale, translate } = transformContext();

  let transform = '';
  $: if (mode === 'canvas') {
    const center = { x: $width / 2, y: $height / 2 };
    const newTranslate = {
      x: $translate.x * $scale + center.x - center.x * $scale,
      y: $translate.y * $scale + center.y - center.y * $scale,
    };
    transform = `translate(${newTranslate.x},${newTranslate.y}) scale(${$scale})`;
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<svg
  bind:this={element}
  {viewBox}
  width={$containerWidth}
  height={$containerHeight}
  style:z-index={zIndex}
  class={cls(
    'layercake-layout-svg',
    'absolute top-0 left-0 overflow-visible',
    pointerEvents === false && 'pointer-events-none',
    $$props.class
  )}
  aria-label={label}
  aria-labelledby={labelledBy}
  aria-describedby={describedBy}
  on:click
  role="figure"
>
  <slot name="title">
    {#if title}<title>{title}</title>{/if}
  </slot>

  <defs>
    <slot name="defs"></slot>
  </defs>

  <g
    bind:this={innerElement}
    class="layercake-layout-svg_g"
    transform="translate({$padding.left}, {$padding.top})"
  >
    <g {transform}>
      <slot {element}></slot>
    </g>
  </g>
</svg>
