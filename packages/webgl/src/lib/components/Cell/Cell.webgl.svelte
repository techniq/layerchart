<script lang="ts" module>
  import type { CellProps } from './Cell.shared.svelte.js';
</script>

<!-- LayerChart's `Cell`, drawn with these marks -->
<script lang="ts">
  import { CellBase } from 'layerchart/base';
  import Rect from '../Rect/Rect.webgl.svelte';
  import Circle from '../Circle/Circle.webgl.svelte';
  import Group from '../Group/Group.webgl.svelte';

  let props: CellProps = $props();
</script>

<CellBase {...props} {Rect} {Circle} {Group} />
