<script lang="ts" module>
  export type { BarProps, BarPropsWithoutHTML } from './Bar.shared.svelte.js';
</script>

<script lang="ts">
  import BarBase from './Bar.base.svelte';
  import Rect from '../Rect/Rect.canvas.svelte';
  import Arc from '../Arc/Arc.canvas.svelte';

  import type { BarProps } from './Bar.shared.svelte.js';

  let props: BarProps = $props();
</script>

<BarBase {Rect} {Arc} {...props} />
