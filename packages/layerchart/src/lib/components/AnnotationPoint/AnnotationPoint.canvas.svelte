<script lang="ts" module>
  export type {
    AnnotationPointProps,
    AnnotationPointPropsWithoutHTML,
  } from './AnnotationPoint.shared.svelte.js';
</script>

<script lang="ts">
  import AnnotationPointBase from './AnnotationPoint.base.svelte';
  import Circle from '../Circle/Circle.canvas.svelte';
  import Link from '../Link/Link.canvas.svelte';
  import Text from '../Text/Text.canvas.svelte';
  import type { AnnotationPointProps } from './AnnotationPoint.shared.svelte.js';

  let props: AnnotationPointProps = $props();
</script>

<AnnotationPointBase {Circle} {Link} {Text} {...props} />
