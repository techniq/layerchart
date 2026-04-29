<script lang="ts" module>
  export type { VectorProps, VectorPropsWithoutHTML, VectorShape } from './Vector.shared.svelte.js';
</script>

<script lang="ts">
  import VectorBase from './Vector.base.svelte';
  import Path from '../Path/Path.svg.svelte';
  import type { VectorProps } from './Vector.shared.svelte.js';

  let props: VectorProps = $props();
</script>

<VectorBase {Path} {...props} />
