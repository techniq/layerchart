<script lang="ts" module>
  import type { LabelsProps } from './Labels.shared.svelte.js';
</script>

<!-- LayerChart's `Labels`, drawn with these marks -->
<script lang="ts">
  import { LabelsBase } from 'layerchart/base';
  import Text from '../Text/Text.webgl.svelte';
  import Group from '../Group/Group.webgl.svelte';
  import Points from '../Points/Points.webgl.svelte';
  import Link from '../Link/Link.webgl.svelte';

  let props: LabelsProps = $props();
</script>

<LabelsBase {...props} {Text} {Group} {Points} {Link} />
