<script lang="ts" module>
  import type { FrameProps } from './Frame.shared.svelte.js';
</script>

<!-- LayerChart's `Frame`, drawn with these marks -->
<script lang="ts">
  import { FrameBase } from 'layerchart/base';
  import Rect from '../Rect/Rect.webgl.svelte';

  let props: FrameProps = $props();
</script>

<FrameBase {...props} {Rect} />
