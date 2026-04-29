<script lang="ts" module>
  export type { PieProps, PiePropsWithoutHTML } from './Pie.shared.svelte.js';
</script>

<script lang="ts">
  import PieBase from './Pie.base.svelte';
  import Arc from '../Arc/Arc.svg.svelte';

  import type { PieProps } from './Pie.shared.svelte.js';

  let props: PieProps = $props();
</script>

<PieBase {Arc} {...props} />
