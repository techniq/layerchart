<script lang="ts" module>
  export type { GeoPathProps, GeoPathPropsWithoutHTML } from './GeoPath.shared.svelte.js';
</script>

<script lang="ts">
  import GeoPathBase from './GeoPath.base.svelte';
  import Path from '../../Path/Path.svg.svelte';
  import PathExtruded from '../../Path/PathExtruded.svg.svelte';
  import type { GeoPathProps } from './GeoPath.shared.svelte.js';

  let props: GeoPathProps = $props();
</script>

<GeoPathBase Path={props.z != null ? PathExtruded : Path} {...props} />
