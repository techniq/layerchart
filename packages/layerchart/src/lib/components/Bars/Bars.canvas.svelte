<script lang="ts" module>
  export type { BarsProps, BarsPropsWithoutHTML } from './Bars.shared.svelte.js';
</script>

<script lang="ts">
  import BarsBase from './Bars.base.svelte';
  import Bar from '../Bar/Bar.canvas.svelte';
  import Group from '../Group/Group.canvas.svelte';

  import type { BarsProps } from './Bars.shared.svelte.js';

  let props: BarsProps = $props();
</script>

<BarsBase {Bar} {Group} {...props} />
