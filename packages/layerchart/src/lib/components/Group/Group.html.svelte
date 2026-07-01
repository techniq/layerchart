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
    // Internal-only: pulled out so `{...rest}` doesn't pollute DOM attrs.
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
    <div
      style:transform="translate({item.x}px, {item.y}px)"
      style:opacity={rest.opacity}
      {...rest}
      class={['lc-group-div', className]}
      ontouchmove={handleTouchMove}
    >
      {@render children?.()}
    </div>
  {/each}
{:else}
  <div
    bind:this={ref}
    style:transform={c.transform}
    style:opacity={rest.opacity}
    in:transitionIn={transitionInParams}
    {...rest}
    class={['lc-group-div', className]}
    ontouchmove={handleTouchMove}
  >
    {@render children?.()}
  </div>
{/if}

<style>
  @layer base {
    :where(.lc-group-div) {
      position: absolute;
    }
  }
</style>
