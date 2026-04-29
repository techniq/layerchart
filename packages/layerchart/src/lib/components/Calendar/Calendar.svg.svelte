<script lang="ts" module>
  export type {
    CalendarProps,
    CalendarPropsWithoutHTML,
    CalendarCell,
  } from './Calendar.shared.svelte.js';
</script>

<script lang="ts">
  import CalendarBase from './Calendar.base.svelte';
  import Rect from '../Rect/Rect.svg.svelte';
  import Text from '../Text/Text.svg.svelte';
  import type { CalendarPropsWithoutHTML } from './Calendar.shared.svelte.js';

  let props: CalendarPropsWithoutHTML = $props();
</script>

<CalendarBase {Rect} {Text} {...props} />
