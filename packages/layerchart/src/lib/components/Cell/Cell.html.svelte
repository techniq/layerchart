<script lang="ts" module>
  export type { CellProps } from './Cell.shared.svelte.js';
</script>

<script lang="ts">
  import CellBase from './Cell.base.svelte';
  import Rect from '../Rect/Rect.html.svelte';
  import Circle from '../Circle/Circle.html.svelte';
  import Group from '../Group/Group.html.svelte';
  import type { CellProps } from './Cell.shared.svelte.js';

  let props: CellProps = $props();
</script>

<CellBase {Rect} {Circle} {Group} {...props} />
