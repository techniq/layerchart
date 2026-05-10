<script lang="ts" module>
  export type { GeoClipPathProps, GeoClipPathPropsWithoutHTML } from './GeoClipPath.shared.svelte.js';
</script>

<script lang="ts">
  import GeoClipPathBase from './GeoClipPath.base.svelte';
  import ClipPath from '../../ClipPath/ClipPath.canvas.svelte';
  import type { GeoClipPathProps } from './GeoClipPath.shared.svelte.js';

  let props: GeoClipPathProps = $props();
</script>

<GeoClipPathBase {ClipPath} {...props} />
