<script lang="ts" module>
  import type { MonthProps } from './Month.shared.svelte.js';
</script>

<!-- LayerChart's `Month`, drawn with these marks -->
<script lang="ts">
  import { MonthBase } from 'layerchart/base';
  import Rect from '../Rect/Rect.webgl.svelte';
  import Group from '../Group/Group.webgl.svelte';
  import Text from '../Text/Text.webgl.svelte';

  let props: MonthProps = $props();
</script>

<MonthBase {...props} {Rect} {Group} {Text} />
