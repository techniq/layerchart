<script lang="ts" module>
  export type { HullProps, HullPropsWithoutHTML } from './Hull.shared.svelte.js';
</script>

<script lang="ts">
  import HullBase from './Hull.base.svelte';
  import Group from '../Group/Group.svg.svelte';
  import Spline from '../Spline/Spline.svg.svelte';
  import type { HullProps } from './Hull.shared.svelte.js';

  let props: HullProps = $props();
</script>

<HullBase {Group} {Spline} {...props} />
