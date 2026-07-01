<script lang="ts" module>
  export type {
    AnnotationPointProps,
    AnnotationPointPropsWithoutHTML,
  } from './AnnotationPoint.shared.svelte.js';
</script>

<script lang="ts">
  import AnnotationPointBase from './AnnotationPoint.base.svelte';
  import Circle from '../Circle/Circle.html.svelte';
  import Text from '../Text/Text.html.svelte';
  import type { AnnotationPointProps } from './AnnotationPoint.shared.svelte.js';

  let props: AnnotationPointProps = $props();
</script>

<!-- Link is intentionally omitted: callout links aren't supported on the HTML layer. -->
<AnnotationPointBase {Circle} {Text} {...props} />
