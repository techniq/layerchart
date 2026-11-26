<script lang="ts" module>
  import type { CalendarProps } from './Calendar.shared.svelte.js';
</script>

<!-- LayerChart's `Calendar`, drawn with these marks -->
<script lang="ts">
  import { CalendarBase } from 'layerchart/base';
  import Rect from '../Rect/Rect.webgl.svelte';
  import Text from '../Text/Text.webgl.svelte';

  let props: CalendarProps = $props();
</script>

<CalendarBase {...props} {Rect} {Text} />
