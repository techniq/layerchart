<script lang="ts" module>
  export type {
    MonthProps,
    MonthPropsWithoutHTML,
    MonthCell,
  } from './Month.shared.svelte.js';
</script>

<script lang="ts">
  import MonthBase from './Month.base.svelte';
  import Rect from '../Rect/Rect.svg.svelte';
  import Group from '../Group/Group.svg.svelte';
  import Text from '../Text/Text.svg.svelte';
  import type { MonthPropsWithoutHTML } from './Month.shared.svelte.js';

  let props: MonthPropsWithoutHTML = $props();
</script>

<MonthBase {Rect} {Group} {Text} {...props} />
