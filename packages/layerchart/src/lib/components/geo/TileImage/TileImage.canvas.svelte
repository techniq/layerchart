<script lang="ts" module>
  export type { TileImageProps, TileImagePropsWithoutHTML } from './TileImage.shared.svelte.js';
</script>

<script lang="ts">
  import TileImageBase from './TileImage.base.svelte';
  import Text from '../../Text/Text.canvas.svelte';
  import type { TileImageProps } from './TileImage.shared.svelte.js';

  let props: TileImageProps = $props();
</script>

<TileImageBase {Text} {...props} />
