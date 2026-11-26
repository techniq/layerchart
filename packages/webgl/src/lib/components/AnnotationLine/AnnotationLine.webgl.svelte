<script lang="ts" module>
  import type { AnnotationLineProps } from './AnnotationLine.shared.svelte.js';
</script>

<!-- LayerChart's `AnnotationLine`, drawn with these marks -->
<script lang="ts">
  import { AnnotationLineBase } from 'layerchart/base';
  import Line from '../Line/Line.webgl.svelte';
  import Text from '../Text/Text.webgl.svelte';

  let props: AnnotationLineProps = $props();
</script>

<AnnotationLineBase {...props} {Line} {Text} />
