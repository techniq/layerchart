<script lang="ts" module>
  export type { GeoPathProps, GeoPathPropsWithoutHTML } from './GeoPath.shared.svelte.js';
</script>

<script lang="ts">
  import GeoPathBase from './GeoPath.base.svelte';
  import Path from '../../Path/Path.canvas.svelte';
  import type { GeoPathProps } from './GeoPath.shared.svelte.js';

  let props: GeoPathProps = $props();
</script>

<GeoPathBase {Path} {...props} />
