<script lang="ts" module>
  export type { AxisProps, AxisPropsWithoutHTML } from './Axis.shared.svelte.js';
</script>

<script lang="ts" generics="T extends Transition = Transition">
  import AxisBase from './Axis.base.svelte';
  import Group from '../Group/Group.html.svelte';
  import Line from '../Line/Line.html.svelte';
  import Text from '../Text/Text.html.svelte';
  import Rule from '../Rule/Rule.html.svelte';

  import type { Transition } from '$lib/utils/types.js';
  import type { AxisProps } from './Axis.shared.svelte.js';

  let props: AxisProps<T> = $props();
</script>

<AxisBase {Group} {Line} {Text} {Rule} {...props} />
