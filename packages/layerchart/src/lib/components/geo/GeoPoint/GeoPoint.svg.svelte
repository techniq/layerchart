<script lang="ts" module>
  export type { GeoPointProps, GeoPointPropsWithoutHTML } from './GeoPoint.shared.svelte.js';
</script>

<script lang="ts">
  import GeoPointBase from './GeoPoint.base.svelte';
  import Circle from '../../Circle/Circle.svg.svelte';
  import Group from '../../Group/Group.svg.svelte';
  import type { GeoPointProps } from './GeoPoint.shared.svelte.js';

  let props: GeoPointProps = $props();
</script>

<GeoPointBase {Circle} {Group} {...props} />
