<script lang="ts" module>
  export type { RibbonProps, RibbonPropsWithoutHTML } from './Ribbon.shared.svelte.js';
</script>

<script lang="ts">
  import RibbonBase from './Ribbon.base.svelte';
  import Path from '../../Path/Path.svg.svelte';
  import type { RibbonProps } from './Ribbon.shared.svelte.js';

  let props: RibbonProps = $props();
</script>

<RibbonBase {Path} {...props} />
