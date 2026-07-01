<script lang="ts" module>
  export type { GeoCircleProps, GeoCirclePropsWithoutHTML } from './GeoCircle.shared.svelte.js';
</script>

<script lang="ts">
  import GeoCircleBase from './GeoCircle.base.svelte';
  import GeoPath from '../GeoPath/GeoPath.svg.svelte';
  import type { GeoCircleProps } from './GeoCircle.shared.svelte.js';

  let props: GeoCircleProps = $props();
</script>

<GeoCircleBase {GeoPath} {...props} />
