<script lang="ts" module>
  export type { PointsProps, PointsPropsWithoutHTML, Point } from './Points.shared.svelte.js';
</script>

<script lang="ts">
  import PointsBase from './Points.base.svelte';
  import Circle from '../Circle/Circle.svg.svelte';

  import type { PointsProps } from './Points.shared.svelte.js';

  let props: PointsProps = $props();
</script>

<PointsBase {Circle} {...props} />
