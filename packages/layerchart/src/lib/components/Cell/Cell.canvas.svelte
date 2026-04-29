<script lang="ts" module>
  export type { CellProps } from './Cell.shared.svelte.js';
</script>

<script lang="ts">
  import CellBase from './Cell.base.svelte';
  import Rect from '../Rect/Rect.canvas.svelte';
  import Circle from '../Circle/Circle.canvas.svelte';
  import Group from '../Group/Group.canvas.svelte';
  import type { CellProps } from './Cell.shared.svelte.js';

  let props: CellProps = $props();
</script>

<CellBase {Rect} {Circle} {Group} {...props} />
