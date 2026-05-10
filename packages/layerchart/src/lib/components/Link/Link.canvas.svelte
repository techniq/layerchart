<script lang="ts" module>
  export type { LinkProps, LinkPropsWithoutHTML } from './Link.shared.svelte.js';
</script>

<script lang="ts">
  import LinkBase from './Link.base.svelte';
  import Path from '../Path/Path.canvas.svelte';
  import type { LinkProps } from './Link.shared.svelte.js';

  let props: LinkProps = $props();
</script>

<LinkBase {Path} {...props} />
