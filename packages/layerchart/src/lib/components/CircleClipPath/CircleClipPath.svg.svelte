<script lang="ts" module>
  export type { CircleClipPathPropsWithoutHTML } from './CircleClipPath.shared.svelte.js';
</script>

<script lang="ts">
  import CircleClipPathBase from './CircleClipPath.base.svelte';
  import ClipPath from '../ClipPath/ClipPath.svg.svelte';
  import type { CircleClipPathPropsWithoutHTML } from './CircleClipPath.shared.svelte.js';

  let props: CircleClipPathPropsWithoutHTML = $props();
</script>

<CircleClipPathBase {ClipPath} {...props} />
