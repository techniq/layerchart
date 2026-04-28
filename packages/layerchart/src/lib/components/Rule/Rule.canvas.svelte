<script lang="ts" module>
  export type { RuleProps, RulePropsWithoutHTML } from './Rule.shared.svelte.js';
</script>

<script lang="ts">
  import RuleBase from './Rule.base.svelte';
  import Group from '../Group/Group.canvas.svelte';
  import Line from '../Line/Line.canvas.svelte';
  import Circle from '../Circle/Circle.canvas.svelte';

  import type { RuleProps } from './Rule.shared.svelte.js';

  let props: RuleProps = $props();
</script>

<RuleBase {Group} {Line} {Circle} {...props} />
