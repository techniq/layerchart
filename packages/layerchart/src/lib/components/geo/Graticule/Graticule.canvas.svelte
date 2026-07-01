<script lang="ts" module>
  export type { GraticuleProps, GraticulePropsWithoutHTML } from './Graticule.shared.svelte.js';
</script>

<script lang="ts">
  import GraticuleBase from './Graticule.base.svelte';
  import Group from '../../Group/Group.canvas.svelte';
  import GeoPath from '../GeoPath/GeoPath.canvas.svelte';
  import type { GraticuleProps } from './Graticule.shared.svelte.js';

  let props: GraticuleProps = $props();
</script>

<GraticuleBase {Group} {GeoPath} {...props} />
