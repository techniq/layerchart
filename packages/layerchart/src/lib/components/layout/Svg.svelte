<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { Without } from '$lib/utils/types.js';
  import type { SVGAttributes } from 'svelte/elements';

  type SVGPropsWithoutHTML = {
    /**
     * A reference to the layer's `<svg>` tag.
     *
     * @bindable
     */
    ref?: SVGSVGElement;

    /**
     * A reference to the layer's `<g>` tag.
     *
     * @bindable
     */
    innerRef?: SVGGElement;

    /**
     * The layer's z-index.
     */
    zIndex?: number;

    /**
     * Set this to `false` to set `pointer-events: none;` on the entire layer.
     */
    pointerEvents?: boolean;

    /**
     * A string passed to the `viewBox` property on the `<svg>` tag.
     */
    viewBox?: string;

    /**
     * Shorthand to set the contents of `<title></title>` for accessibility.
     * You can also set arbitrary HTML via the title snippet but this is a convenient shorthand.
     */
    title?: string | Snippet;

    /**
     * The inner content of the `<defs>` tag.
     */
    defs?: Snippet;

    /**
     * Translate children to center (useful for radial layouts)
     */
    center?: boolean | 'x' | 'y';

    /**
     * Ignore TransformContext.
     * Useful to add static elements such as legends.
     */
    ignoreTransform?: boolean;

    children?: Snippet<[{ ref: SVGElement }]>;
  };

  export type SVGProps = SVGPropsWithoutHTML &
    Without<SVGAttributes<SVGElement>, SVGPropsWithoutHTML>;
</script>

<script lang="ts">
  import { getTransformContext } from '../TransformContext.svelte';

  import { setRenderContext } from '../Chart.svelte';
  import { getChartContext } from '$lib/contexts/chart.js';

  let {
    ref: refProp = $bindable(),
    innerRef: innerRefProp = $bindable(),
    zIndex = 0,
    pointerEvents,
    viewBox,
    ignoreTransform = false,
    center = false,
    class: className,
    title,
    defs,
    children,
    ...restProps
  }: SVGProps = $props();

  let ref = $state<SVGSVGElement>();
  let innerRef = $state<SVGGElement>();

  $effect.pre(() => {
    refProp = ref;
  });
  $effect.pre(() => {
    innerRefProp = innerRef;
  });

  const ctx = getChartContext();
  const transformCtx = getTransformContext();

  const transform = $derived.by(() => {
    if (transformCtx.mode === 'canvas' && !ignoreTransform) {
      return `translate(${transformCtx.translate.x},${transformCtx.translate.y}) scale(${transformCtx.scale})`;
    } else if (center) {
      return `translate(${center === 'x' || center === true ? ctx.width / 2 : 0}, ${center === 'y' || center === true ? ctx.height / 2 : 0})`;
    }
  });

  setRenderContext('svg');
</script>

<svg
  bind:this={ref}
  {viewBox}
  width={ctx.containerWidth}
  height={ctx.containerHeight}
  style:z-index={zIndex}
  class={['lc-layout-svg', className]}
  class:disablePointerEvents={pointerEvents === false}
  role="figure"
  {...restProps}
>
  {#if typeof title === 'function'}
    {@render title()}
  {:else if title}
    <title class="lc-layout-svg-title">{title}</title>
  {/if}

  <defs>
    {@render defs?.()}
  </defs>

  <g
    bind:this={innerRef}
    class="lc-layout-svg-g"
    transform="translate({ctx.padding.left}, {ctx.padding.top})"
  >
    {#if transform}
      <g {transform} class="lc-layout-svg-g-transform">
        {@render children?.({ ref })}
      </g>
    {:else}
      {@render children?.({ ref })}
    {/if}
  </g>
</svg>

<style>
  @layer base {
    :where(.lc-layout-svg) {
      position: absolute;
      inset: 0;
      overflow: visible; /* match html and allow viewing outside of bounds (useful for axis that leak and general debugging)*/

      &.disablePointerEvents {
        pointer-events: none;
      }
    }
  }
</style>
