<script lang="ts" module>
  export type { LabelsProps, LabelsPropsWithoutHTML } from './Labels.shared.svelte.js';
</script>

<script lang="ts" generics="TData = any">
  import LabelsBase from './Labels.base.svelte';
  import Text from '../Text/Text.canvas.svelte';
  import Group from '../Group/Group.canvas.svelte';
  import Points from '../Points/Points.canvas.svelte';

  import type { LabelsProps } from './Labels.shared.svelte.js';

  let props: LabelsProps<TData> = $props();
</script>

<LabelsBase {Text} {Group} {Points} {...props} />
