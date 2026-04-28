<script lang="ts" module>
  export type {
    AnnotationPointProps,
    AnnotationPointPropsWithoutHTML,
  } from './AnnotationPoint.shared.svelte.js';
</script>

<script lang="ts">
  import AnnotationPointBase from './AnnotationPoint.base.svelte';
  import Circle from '../Circle/Circle.svg.svelte';
  import Link from '../Link/Link.svg.svelte';
  import Text from '../Text/Text.svg.svelte';
  import type { AnnotationPointProps } from './AnnotationPoint.shared.svelte.js';

  let props: AnnotationPointProps = $props();
</script>

<AnnotationPointBase {Circle} {Link} {Text} {...props} />
