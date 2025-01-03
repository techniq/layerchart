<script lang="ts">
  import { computedStyles } from '@layerstack/svelte-actions';
  import { cls } from '@layerstack/tailwind';

  let className: string | undefined = undefined;
  export { className as class };

  let styles: CSSStyleDeclaration;
</script>

<div
  class={cls('ComputedStyles hidden', className)}
  use:computedStyles={(_styles) => (styles = _styles)}
></div>

<slot {styles} />
