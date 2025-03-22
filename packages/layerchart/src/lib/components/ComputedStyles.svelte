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
  import { computedStyles } from '@layerstack/svelte-actions';
  import { cls } from '@layerstack/tailwind';

  let { class: className, children }: ComputedStylesProps = $props();

  let styles: CSSStyleDeclaration = $state({}) as CSSStyleDeclaration;
</script>

<div
  class={cls('ComputedStyles hidden', className)}
  use:computedStyles={(_styles) => (styles = _styles)}
></div>

{@render children?.({ styles })}
