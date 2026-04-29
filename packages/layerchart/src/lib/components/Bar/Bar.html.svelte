<script lang="ts" module>
  export type { BarProps, BarPropsWithoutHTML } from './Bar.shared.svelte.js';
</script>

<script lang="ts">
  import BarBase from './Bar.base.svelte';
  import Rect from '../Rect/Rect.html.svelte';

  import type { BarProps } from './Bar.shared.svelte.js';

  let props: BarProps = $props();
</script>

<!-- Arc is intentionally omitted: radial charts aren't supported on the HTML layer. -->
<BarBase {Rect} {...props} />
