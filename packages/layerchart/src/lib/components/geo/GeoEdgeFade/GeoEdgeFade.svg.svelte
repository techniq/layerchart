<script lang="ts" module>
  export type { GeoEdgeFadeProps, GeoEdgeFadePropsWithoutHTML } from './GeoEdgeFade.shared.svelte.js';
</script>

<script lang="ts">
  import GeoEdgeFadeBase from './GeoEdgeFade.base.svelte';
  import Group from '../../Group/Group.svg.svelte';
  import type { GeoEdgeFadeProps } from './GeoEdgeFade.shared.svelte.js';

  let props: GeoEdgeFadeProps = $props();
</script>

<GeoEdgeFadeBase {Group} {...props} />
