<script lang="ts" module>
  export type { LabelsProps, LabelsPropsWithoutHTML } from './Labels.shared.svelte.js';
</script>

<script lang="ts" generics="TData = any">
  import LabelsBase from './Labels.base.svelte';
  import Text from '../Text/Text.svg.svelte';
  import Group from '../Group/Group.svg.svelte';
  import Points from '../Points/Points.svg.svelte';

  import type { LabelsProps } from './Labels.shared.svelte.js';

  let props: LabelsProps<TData> = $props();
</script>

<LabelsBase {Text} {Group} {Points} {...props} />
