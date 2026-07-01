<script lang="ts" module>
  export type { BlurProps, BlurPropsWithoutHTML } from './Blur.shared.svelte.js';
</script>

<script lang="ts">
  import type { BlurProps } from './Blur.shared.svelte.js';

  let { children }: BlurProps = $props();
</script>

{@render children?.()}
