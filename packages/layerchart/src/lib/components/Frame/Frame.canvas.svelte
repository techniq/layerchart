<script lang="ts" module>
  export type { FrameProps, FramePropsWithoutHTML } from './Frame.shared.svelte.js';
</script>

<script lang="ts">
  import FrameBase from './Frame.base.svelte';
  import Rect from '../Rect/Rect.canvas.svelte';
  import type { FrameProps } from './Frame.shared.svelte.js';

  let props: FrameProps = $props();
</script>

<FrameBase {Rect} {...props} />
