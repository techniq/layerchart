<script lang="ts" module>
  export type {
    GroupProps,
    GroupPropsWithoutHTML,
  } from './Group.shared.svelte.js';
</script>

<script lang="ts" generics="T extends import('$lib/utils/types.js').Transition = import('$lib/utils/types.js').Transition">
  import type { TouchEventHandler } from 'svelte/elements';
  import { GroupState, type GroupProps } from './Group.shared.svelte.js';

  let {
    preventTouchMove = false,
    transitionIn: transitionInProp,
    transitionInParams: transitionInParamsProp,
    class: className,
    children,
    ref: refProp = $bindable(),
    // Pull out props that collide with `<g>` SVG attribute names so the
    // `{...rest}` spread doesn't mistakenly set `x="someAccessor"` etc.
    x,
    y,
    initialX,
    initialY,
    data,
    key,
    center,
    motion,
    ...rest
  }: GroupProps<T> = $props();

  const c = new GroupState(
    () =>
      ({
        preventTouchMove,
        transitionIn: transitionInProp,
        transitionInParams: transitionInParamsProp,
        class: className,
        children,
        x,
        y,
        initialX,
        initialY,
        data,
        key,
        center,
        motion,
        ...rest,
      }) as GroupProps
  );

  let ref = $state<Element>();

  $effect.pre(() => {
    refProp = ref;
  });

  const transitionIn = $derived(transitionInProp ?? c.defaultTransitionIn) as T;
  const transitionInParams = $derived(transitionInParamsProp ?? c.defaultTransitionInParams);

  const handleTouchMove: TouchEventHandler<Element> = (e) => {
    if (preventTouchMove) {
      e.preventDefault();
    }
    (rest as any).ontouchmove?.(e);
  };
</script>

{#if c.dataMode}
  {#each c.resolvedItems as item (item.key)}
    <g
      style:transform="translate({item.x}px, {item.y}px)"
      class={['lc-group-g', className]}
      opacity={rest.opacity}
      {...rest}
      ontouchmove={handleTouchMove}
    >
      {@render children?.()}
    </g>
  {/each}
{:else}
  <g
    style:transform={c.transform}
    class={['lc-group-g', className]}
    in:transitionIn={transitionInParams}
    opacity={rest.opacity}
    {...rest}
    ontouchmove={handleTouchMove}
    bind:this={ref}
  >
    {@render children?.()}
  </g>
{/if}
