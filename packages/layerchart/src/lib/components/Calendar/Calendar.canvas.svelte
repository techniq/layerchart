<script lang="ts" module>
  export type {
    CalendarProps,
    CalendarPropsWithoutHTML,
    CalendarCell,
  } from './Calendar.shared.svelte.js';
</script>

<script lang="ts">
  import CalendarBase from './Calendar.base.svelte';
  import Rect from '../Rect/Rect.canvas.svelte';
  import Text from '../Text/Text.canvas.svelte';
  import type { CalendarPropsWithoutHTML } from './Calendar.shared.svelte.js';

  let props: CalendarPropsWithoutHTML = $props();
</script>

<CalendarBase {Rect} {Text} {...props} />
