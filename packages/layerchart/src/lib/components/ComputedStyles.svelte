<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  export type ComputedStylesPropsWithoutHTML = {
    class?: HTMLAttributes<HTMLElement>['class'];
    children?: Snippet<[{ styles: CSSStyleDeclaration }]>;
  };

  export type ComputedStylesProps = ComputedStylesPropsWithoutHTML;
</script>

<script lang="ts">
  import { computedStyles } from '@layerstack/svelte-actions/styles';
  import { clsx } from 'clsx';

  let { class: className, children }: ComputedStylesProps = $props();

  let styles: CSSStyleDeclaration = $state({}) as CSSStyleDeclaration;
</script>

<div
  class={clsx('lc-computed-styles', className)}
  use:computedStyles={(_styles) => (styles = _styles)}
></div>

{@render children?.({ styles })}

<style>
  @layer base {
    :global(:where(.lc-computed-styles)) {
      display: none;
    }
  }
</style>
