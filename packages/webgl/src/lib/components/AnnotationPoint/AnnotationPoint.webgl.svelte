<script lang="ts" module>
  import type { AnnotationPointProps } from './AnnotationPoint.shared.svelte.js';
</script>

<!-- LayerChart's `AnnotationPoint`, drawn with these marks -->
<script lang="ts">
  import { AnnotationPointBase } from 'layerchart/base';
  import Circle from '../Circle/Circle.webgl.svelte';
  import Link from '../Link/Link.webgl.svelte';
  import Text from '../Text/Text.webgl.svelte';

  let props: AnnotationPointProps = $props();
</script>

<AnnotationPointBase {...props} {Circle} {Link} {Text} />
