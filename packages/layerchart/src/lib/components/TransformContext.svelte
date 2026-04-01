<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';
  import { TransformState, type TransformStateOptions } from '$lib/states/transform.svelte.js';
  import type { MotionProp } from '$lib/utils/motion.svelte.js';

  type TransformContextPropsWithoutHTML = TransformStateOptions & {
    /**
     * A bindable reference to TransformState.
     *
     * @bindable
     */
    state?: TransformState;

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
    state: stateProp = $bindable(),
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
    axis,
    motion,
    processTranslate,
    disablePointer,
    scrollMode,
    clickDistance,
    initialTranslate,
    initialScale,
    onTransform,
    ondragstart,
    ondragend,
    scaleExtent,
    translateExtent,
    constrain,
    inertia,
    scrollActivationKey,
    ...restProps
  }: TransformContextProps = $props();

  const options: TransformStateOptions = {
    mode,
    axis,
    motion,
    processTranslate,
    disablePointer,
    scrollMode,
    clickDistance,
    initialTranslate,
    initialScale,
    onTransform,
    ondragstart,
    ondragend,
    scaleExtent,
    translateExtent,
    constrain,
    inertia,
    scrollActivationKey,
  };

  let ref = $state<HTMLElement>();
  $effect.pre(() => {
    refProp = ref;
  });

  const ctx = getChartContext();

  // Create TransformState instance
  const transformState = new TransformState(ctx, options);

  // Sync initial transform values when they change (e.g., when projection changes for geo transforms)
  $effect.pre(() => {
    const newTranslate = initialTranslate ?? { x: 0, y: 0 };
    const newScale = initialScale ?? 1;
    // Only reset if values actually changed from current initial values
    if (
      newTranslate.x !== transformState.initialTranslate.x ||
      newTranslate.y !== transformState.initialTranslate.y ||
      newScale !== transformState.initialScale
    ) {
      transformState.initialTranslate = newTranslate;
      transformState.initialScale = newScale;
      transformState.reset();
    }
  });

  $effect.pre(() => {
    if (scrollMode !== undefined) {
      transformState.scrollMode = scrollMode;
    }
  });

  $effect.pre(() => {
    transformState.constrain = constrain;
  });

  $effect.pre(() => {
    transformState.scaleExtent = scaleExtent;
  });

  $effect.pre(() => {
    transformState.translateExtent = translateExtent;
  });

  $effect.pre(() => {
    if (inertia === true) {
      transformState.inertia = {
        enabled: true,
        decay: 0.99,
        minVelocity: 0.1,
        maxVelocity: Infinity,
        velocityWindow: 160,
      };
    } else if (typeof inertia === 'object') {
      transformState.inertia = {
        enabled: true,
        decay: inertia.decay ?? 0.99,
        minVelocity: inertia.minVelocity ?? 0.1,
        maxVelocity: inertia.maxVelocity ?? Infinity,
        velocityWindow: inertia.velocityWindow ?? 160,
      };
    } else {
      transformState.inertia = {
        enabled: false,
        decay: 0.99,
        minVelocity: 0.1,
        maxVelocity: Infinity,
        velocityWindow: 160,
      };
    }
  });

  $effect.pre(() => {
    transformState.scrollActivationKey = scrollActivationKey;
  });

  // Bind `state` prop
  stateProp = transformState;

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
