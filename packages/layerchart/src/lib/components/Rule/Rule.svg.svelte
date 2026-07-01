<script lang="ts" module>
  export type { RuleProps, RulePropsWithoutHTML } from './Rule.shared.svelte.js';
</script>

<script lang="ts">
  import RuleBase from './Rule.base.svelte';
  import Group from '../Group/Group.svg.svelte';
  import Line from '../Line/Line.svg.svelte';
  import Circle from '../Circle/Circle.svg.svelte';

  import type { RuleProps } from './Rule.shared.svelte.js';

  let props: RuleProps = $props();
</script>

<RuleBase {Group} {Line} {Circle} {...props} />
