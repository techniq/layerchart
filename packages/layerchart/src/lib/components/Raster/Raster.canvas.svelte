<script lang="ts" module>
  export type { RasterProps, RasterPropsWithoutHTML } from './Raster.shared.svelte.js';
</script>

<script lang="ts">
  import RasterBase from './Raster.base.svelte';
  import Image from '../Image/Image.canvas.svelte';
  import type { RasterProps } from './Raster.shared.svelte.js';

  let props: RasterProps = $props();
</script>

<RasterBase {Image} {...props} />
