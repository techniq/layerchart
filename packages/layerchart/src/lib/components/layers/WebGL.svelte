<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { Without } from '$lib/utils/types.js';
  import type { HTMLCanvasAttributes } from 'svelte/elements';

  export type WebGLPropsWithoutHTML = {
    /**
     * A reference to the  `<canvas>` element.
     *
     * @bindable
     */
    ref?: HTMLCanvasElement;

    /**
     * The layer's z-index.
     */
    zIndex?: number;

    /**
     * Set this to `false` to set `pointer-events: none;` on the entire layer.
     *
     * @default true
     */
    pointerEvents?: boolean;

    /**
     * The second argument passed to canvas.getContext.
     *
     * See the WebGL docs [for more info](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext).
     */
    contextAttributes?: Parameters<HTMLCanvasElement['getContext']>[1];

    /**
     * The `<canvas>`'s WebGL context.
     * @bindable
     */
    context?: WebGLRenderingContext;

    /**
     * Text to display if the browser won't render a canvas tag.
     * You can also set arbitrary HTML via the `fallback` snippet but this is fine
     * if you just need text. If you use the `fallback` snippet, this prop is ignored.
     */
    fallback?: string | Snippet;

    children?: Snippet<
      [{ ref: HTMLCanvasElement; webGLContext: WebGLRenderingContext | undefined }]
    >;
  };

  export type WebGLProps = WebGLPropsWithoutHTML &
    Without<HTMLCanvasAttributes, WebGLPropsWithoutHTML>;

  export type WebGLContextValue = {
    gl: WebGLRenderingContext | null;
  };

  const _WebGLContext = new Context<WebGLContextValue>('WebGL');

  export function setWebGLContext(context: WebGLContextValue) {
    return _WebGLContext.set(context);
  }

  export function getWebGLContext() {
    const defaultContext: WebGLContextValue = $state({ gl: null });
    return _WebGLContext.getOr(defaultContext);
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { Context } from 'runed';

  let {
    context = $bindable(),
    ref: refProp = $bindable(),
    contextAttributes,
    fallback = '',
    pointerEvents = true,
    zIndex = 0,
    class: className,
    children,
    ...restProps
  }: WebGLProps = $props();

  let ref = $state<HTMLCanvasElement>();
  $effect.pre(() => {
    refProp = ref;
  });

  let testGl;

  const ctx = getChartContext();

  onMount(() => {
    /* --------------------------------------------
     * Try to find a working webgl context
     */
    const contexts = ['webgl', 'experimental-webgl', 'moz-webgl', 'webkit-3d'];
    for (let j = 0; j < contexts.length; j++) {
      testGl = ref?.getContext(contexts[j], contextAttributes);
      if (testGl) {
        // @ts-ignore
        context = testGl;
        break;
      }
    }
  });

  setWebGLContext({
    get gl() {
      return context ?? null;
    },
    set gl(v: WebGLRenderingContext | null) {
      if (v) {
        context = v;
      }
      context = undefined;
    },
  });
</script>

<canvas
  bind:this={ref}
  class={['lc-layout-webgl', className]}
  class:disablePointerEvents={pointerEvents === false}
  style:z-index={zIndex}
  style:top={ctx.padding.top + 'px'}
  style:right={ctx.padding.right + 'px'}
  style:bottom={ctx.padding.bottom + 'px'}
  style:left={ctx.padding.left + 'px'}
  {...restProps}
>
  {#if typeof fallback === 'function'}
    {@render fallback()}
  {:else if fallback}
    {fallback}
  {/if}
</canvas>

{@render children?.({ ref, webGLContext: context })}

<style>
  @layer base {
    :where(.lc-layout-webgl) {
      position: absolute;
      inset: 0;

      &.disablePointerEvents {
        pointer-events: none;
      }
    }
  }
</style>
