<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';
  import { setTransformContext } from '$lib/contexts/transform.js';
  import { TransformState, type TransformStateOptions } from '$lib/states/transform.svelte.js';
  import type { MotionProp } from '$lib/utils/motion.svelte.js';

  type TransformContextPropsWithoutHTML = TransformStateOptions & {
    /**
     * Backwards compatible binding (deprecated - use transformState instead)
     *
     * @bindable
     * @deprecated Use transformState instead
     */
    transformContext?: TransformState;

    /**
     * A bindable reference to TransformState.
     *
     * @bindable
     */
    transformState?: TransformState;

    ref?: HTMLElement;
    children?: Snippet<[{ transformState: TransformState }]>;

    motion?: MotionProp;
  };

  type TransformContextProps = TransformContextPropsWithoutHTML &
    Without<HTMLAttributes<HTMLElement>, TransformContextPropsWithoutHTML>;
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Without } from '$lib/utils/types.js';
  import { getChartContext } from '$lib/contexts/chart.js';

  let {
    transformContext: transformContextProp = $bindable(),
    transformState: transformStateProp = $bindable(),
    onwheel = () => {},
    onpointerdown = () => {},
    onpointermove = () => {},
    ontouchmove = () => {},
    onpointerup = () => {},
    ondblclick = () => {},
    onclickcapture = () => {},
    ref: refProp = $bindable(),
    children,
    class: className,
    mode,
    motion,
    processTranslate,
    disablePointer,
    initialScrollMode,
    clickDistance,
    initialTranslate,
    initialScale,
    onTransform,
    ondragstart,
    ondragend,
    ...restProps
  }: TransformContextProps = $props();

  const options: TransformStateOptions = {
    mode,
    motion,
    processTranslate,
    disablePointer,
    initialScrollMode,
    clickDistance,
    initialTranslate,
    initialScale,
    onTransform,
    ondragstart,
    ondragend,
  };

  let ref = $state<HTMLElement>();
  $effect.pre(() => {
    refProp = ref;
  });

  const ctx = getChartContext();

  // Create TransformState instance
  const transformState = new TransformState(ctx, options);

  // Set both bindable props for backwards compatibility
  transformContextProp = transformState;
  transformStateProp = transformState;

  function onPointerDown(e: PointerEvent & { currentTarget: HTMLElement }) {
    onpointerdown?.(e);
    transformState.onPointerDown(e);
  }

  function onPointerMove(e: PointerEvent & { currentTarget: HTMLElement }) {
    onpointermove?.(e);
    transformState.onPointerMove(e);
  }

  function onPointerUp(e: PointerEvent & { currentTarget: HTMLElement }) {
    onpointerup?.(e);
    transformState.onPointerUp(e);
  }

  function onClick(e: MouseEvent & { currentTarget: HTMLElement }) {
    onclickcapture?.(e);
    if (transformState.dragging) {
      // Do not propagate click event to children if drag/moved.  Registered in capture phase (top-down)
      e.stopPropagation();
    }
  }

  function onDoubleClick(e: MouseEvent & { currentTarget: HTMLElement }) {
    ondblclick?.(e);
    transformState.onDoubleClick(e);
  }

  function onWheel(e: WheelEvent & { currentTarget: HTMLElement }) {
    onwheel?.(e);
    transformState.onWheel(e);
  }

  setTransformContext(transformState);
</script>

<div
  onwheel={onWheel}
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  ontouchmove={(e) => {
    ontouchmove?.(e);
    // Touch events cause pointer events to be interrupted.
    // Typically `touch-action: none` works, but doesn't appear to with SVG, but `preventDefault()` works here
    // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events#touch-action_css_property
    if (transformState.mode !== 'none' && !transformState.disablePointer) {
      e.preventDefault();
    }
  }}
  onpointerup={onPointerUp}
  ondblclick={onDoubleClick}
  onclickcapture={onClick}
  class={['lc-transform-context', className]}
  bind:this={ref}
  {...restProps}
>
  {@render children?.({ transformState })}
</div>

<style>
  @layer base {
    :where(.lc-transform-context) {
      height: 100%;
    }
  }
</style>
