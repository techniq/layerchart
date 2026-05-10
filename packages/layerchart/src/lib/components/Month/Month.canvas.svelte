<script lang="ts" module>
  export type {
    MonthProps,
    MonthPropsWithoutHTML,
    MonthCell,
  } from './Month.shared.svelte.js';
</script>

<script lang="ts">
  import MonthBase from './Month.base.svelte';
  import Rect from '../Rect/Rect.canvas.svelte';
  import Group from '../Group/Group.canvas.svelte';
  import Text from '../Text/Text.canvas.svelte';
  import type { MonthPropsWithoutHTML } from './Month.shared.svelte.js';

  let props: MonthPropsWithoutHTML = $props();
</script>

<MonthBase {Rect} {Group} {Text} {...props} />
