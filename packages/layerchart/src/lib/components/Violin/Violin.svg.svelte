<script lang="ts" module>
  export type { ViolinProps, ViolinPropsWithoutHTML } from './Violin.shared.svelte.js';
</script>

<script lang="ts">
  import ViolinBase from './Violin.base.svelte';
  import Group from '../Group/Group.svg.svelte';
  import Path from '../Path/Path.svg.svelte';
  import Rect from '../Rect/Rect.svg.svelte';
  import Line from '../Line/Line.svg.svelte';
  import type { ViolinProps } from './Violin.shared.svelte.js';

  let props: ViolinProps = $props();
</script>

<ViolinBase {Group} {Path} {Rect} {Line} {...props} />
