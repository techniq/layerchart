<script lang="ts" module>
  import type { ViolinProps } from './Violin.shared.svelte.js';
</script>

<!-- LayerChart's `Violin`, drawn with these marks -->
<script lang="ts">
  import { ViolinBase } from 'layerchart/base';
  import Group from '../Group/Group.webgl.svelte';
  import Path from '../Path/Path.webgl.svelte';
  import Rect from '../Rect/Rect.webgl.svelte';
  import Line from '../Line/Line.webgl.svelte';

  let props: ViolinProps = $props();
</script>

<ViolinBase {...props} {Group} {Path} {Rect} {Line} />
