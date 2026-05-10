<script lang="ts" module>
  export type { ViolinProps, ViolinPropsWithoutHTML } from './Violin.shared.svelte.js';
</script>

<script lang="ts">
  import ViolinBase from './Violin.base.svelte';
  import Group from '../Group/Group.canvas.svelte';
  import Path from '../Path/Path.canvas.svelte';
  import Rect from '../Rect/Rect.canvas.svelte';
  import Line from '../Line/Line.canvas.svelte';
  import type { ViolinProps } from './Violin.shared.svelte.js';

  let props: ViolinProps = $props();
</script>

<ViolinBase {Group} {Path} {Rect} {Line} {...props} />
