<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Without } from '$lib/utils/types.js';
  import type { Snippet } from 'svelte';

  type HTMLPropsWithoutHTML = {
    /**
     * A reference to the layer's outermost `<div>` tag.
     *
     * @bindable
     */
    ref?: HTMLElement;

    /**
     * The layer's z-index.
     */
    zIndex?: number;

    /**
     * Set this to `false` to set `pointer-events: none;` on the entire layer.
     */
    pointerEvents?: boolean;

    /**
     * A string passed to the `aria-role` on the `<div>` tag.
     * This is `undefined` by default but will be set by default to `'figure'`
     * if `label`, `labelledby` or `describedby` is set. That default will be overridden by whatever is passed in.
     */
    role?: string;

    /**
     * Translate children to center (useful for radial layouts)
     */
    center?: boolean | 'x' | 'y';

    /**
     * Ignore TransformContext.  Useful to add static elements such as legends.
     */
    ignoreTransform?: boolean;

    children?: Snippet<[{ ref: HTMLElement }]>;
  };

  export type HTMLProps = HTMLPropsWithoutHTML &
    Without<HTMLAttributes<HTMLElement>, HTMLPropsWithoutHTML>;
</script>

<script lang="ts">
  import { getTransformContext } from '../TransformContext.svelte';

  import { setRenderContext } from '../Chart.svelte';
  import { getChartContext } from '$lib/contexts/chart.js';

  let {
    ref: refProp = $bindable(),
    zIndex = 0,
    pointerEvents = true,
    role,
    'aria-label': label,
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
    center = false,
    ignoreTransform = false,
    class: className,
    children,
    ...restProps
  }: HTMLProps = $props();

  let ref = $state<HTMLElement>();
  $effect.pre(() => {
    refProp = ref;
  });

  const roleVal = $derived(role || (label || labelledBy || describedBy ? 'figure' : undefined));

  const ctx = getChartContext();
  const transformCtx = getTransformContext();

  const transform = $derived.by(() => {
    if (transformCtx.mode === 'canvas' && !ignoreTransform) {
      return `translate(${transformCtx.translate.x}px,${transformCtx.translate.y}px) scale(${transformCtx.scale})`;
    } else if (center) {
      return `translate(${center === 'x' || center === true ? ctx.width / 2 : 0}px, ${center === 'y' || center === true ? ctx.height / 2 : 0}px)`;
    }
  });

  setRenderContext('html');
</script>

<div
  bind:this={ref}
  class={['lc-layout-html', className]}
  class:disablePointerEvents={pointerEvents === false}
  style:transform
  style:transform-origin="top left"
  style:z-index={zIndex}
  style:top="{ctx.padding.top}px"
  style:bottom="{ctx.padding.bottom}px"
  style:left="{ctx.padding.left}px"
  style:right="{ctx.padding.right}px"
  role={roleVal}
  aria-label={label}
  aria-labelledby={labelledBy}
  aria-describedby={describedBy}
  {...restProps}
>
  {@render children?.({ ref })}
</div>

<style>
  @layer base {
    :where(.lc-layout-html) {
      position: absolute;
      inset: 0;

      &.disablePointerEvents {
        pointer-events: none;
      }
    }
  }
</style>
