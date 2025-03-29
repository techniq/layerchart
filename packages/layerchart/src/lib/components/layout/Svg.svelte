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
    ref?: SVGElement;

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
  import { cls } from '@layerstack/tailwind';
  import { getTransformContext } from '../TransformContext.svelte';

  import { getChartContext, setRenderContext } from '../Chart.svelte';
  import { layerClass } from '$lib/utils/attributes.js';

  let {
    ref = $bindable(),
    innerRef = $bindable(),
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
  class={cls(
    layerClass('layout-svg'),
    'absolute top-0 left-0 overflow-visible',
    pointerEvents === false && 'pointer-events-none',
    className
  )}
  role="figure"
  {...restProps}
>
  {#if typeof title === 'function'}
    {@render title()}
  {:else if title}
    <title class={layerClass('layout-svg-title')}>{title}</title>
  {/if}

  <defs>
    {@render defs?.()}
  </defs>

  <g
    bind:this={innerRef}
    class={layerClass('layout-svg-g')}
    transform="translate({ctx.padding.left}, {ctx.padding.top})"
  >
    {#if transform}
      <g {transform} class={layerClass('layout-svg-g-transform')}>
        {@render children?.({ ref })}
      </g>
    {:else}
      {@render children?.({ ref })}
    {/if}
  </g>
</svg>
