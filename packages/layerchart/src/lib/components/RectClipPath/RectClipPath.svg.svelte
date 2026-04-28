<script lang="ts" module>
  export type { RectClipPathProps, RectClipPathPropsWithoutHTML } from './RectClipPath.shared.svelte.js';
</script>

<script lang="ts">
  import RectClipPathBase from './RectClipPath.base.svelte';
  import ClipPath from '../ClipPath/ClipPath.svg.svelte';

  import type { RectClipPathProps } from './RectClipPath.shared.svelte.js';

  let props: RectClipPathProps = $props();
</script>

<RectClipPathBase {ClipPath} {...props} />
