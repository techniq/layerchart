<script lang="ts" module>
  export type { GridProps, GridPropsWithoutHTML } from './Grid.shared.svelte.js';
</script>

<script lang="ts" generics="T extends Transition = Transition">
  import GridBase from './Grid.base.svelte';
  import Group from '../Group/Group.svg.svelte';
  import Line from '../Line/Line.svg.svelte';
  import Circle from '../Circle/Circle.svg.svelte';
  import Rule from '../Rule/Rule.svg.svelte';

  import type { Transition } from '$lib/utils/types.js';
  import type { GridProps } from './Grid.shared.svelte.js';

  let props: GridProps<T> = $props();
</script>

<GridBase {Group} {Line} {Circle} {Rule} {...props} />
